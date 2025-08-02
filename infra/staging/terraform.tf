terraform {
  backend "s3" {
    bucket = "readyprep-infra"
    key = "staging.tfstate"
    profile ="readyprep-prod"
    region = "us-east-1"
    dynamodb_table = "Terraform"
  }
}

provider "aws" {
  profile = "readyprep-staging"
  region = "us-east-1"
}

data "aws_availability_zones" "available" {}
data "aws_caller_identity" "current" {}

# VPC and Subnets

resource "aws_vpc" "main" {
  cidr_block = "172.21.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  count = 3
}

resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, 100 + count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  count = 3
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route" "internet_access" {
  route_table_id         = aws_vpc.main.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.gw.id
}

# Security Groups

resource "aws_security_group" "lb" {
  name        = "Load Balancer"
  description = "controls access to the ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_tasks" {
  name        = "Application Container"
  description = "allow inbound access from the ALB only"
  vpc_id      = aws_vpc.main.id

  ingress {
    protocol        = "tcp"
    from_port       = 3000
    to_port         = 3000
    security_groups = [aws_security_group.lb.id]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "database" {
  name        = "Database"
  description = "allow inbound access from ECS containers only"
  vpc_id      = aws_vpc.main.id

  ingress {
    protocol        = "tcp"
    from_port       = 5432
    to_port         = 5432
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Database

resource "aws_db_subnet_group" "readyprep" {
  name = "readyprep"
  subnet_ids = aws_subnet.private.*.id
  description = "ReadyPrep Database subnet group"
}

resource "random_password" "password" {
  length = 30
}

resource "aws_db_instance" "default" {
  identifier = "readyprep-db"
  engine               = "postgres"
  engine_version       = "12.2"
  instance_class       = "db.t3.small"
  db_subnet_group_name = aws_db_subnet_group.readyprep.name
  vpc_security_group_ids = [aws_security_group.database.id]
  storage_type         = "gp2"
  allocated_storage    = 20
  max_allocated_storage = 1000
  name                 = "ReadyPrep"
  username             = "readyprep"
  password = random_password.password.result
  parameter_group_name = "default.postgres12"

  backup_retention_period = 35
  backup_window = "09:00-10:00"
  delete_automated_backups = false

  maintenance_window = "Tue:10:15-Tue:12:00"
  apply_immediately = true

  enabled_cloudwatch_logs_exports = [ "postgresql", "upgrade" ]
}

resource "aws_ssm_parameter" "database-host" {
  name = "/database/host"
  type = "String"
  value = aws_db_instance.default.address
}

resource "aws_ssm_parameter" "database-port" {
  name = "/database/port"
  type = "String"
  value = aws_db_instance.default.port
}

resource "aws_ssm_parameter" "database-password" {
  name = "/database/password"
  type = "SecureString"
  value = random_password.password.result
}

# Application Load Balancer

resource "aws_alb" "main" {
  name            = "ReadyPrep-ALB"
  subnets         = aws_subnet.public.*.id
  security_groups = [aws_security_group.lb.id]
}

resource "aws_alb_target_group" "app" {
  name        = "App-Containers"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  deregistration_delay = 15
}

resource "aws_alb_listener" "http" {
  load_balancer_arn = aws_alb.main.id
  port              = 80
  protocol          = "HTTP"
 
  default_action {
   type = "redirect"
 
   redirect {
     port        = 443
     protocol    = "HTTPS"
     status_code = "HTTP_301"
   }
  }
}

resource "aws_alb_listener" "front_end" {
  load_balancer_arn = aws_alb.main.id
  port              = 443 
  protocol          = "HTTPS"
  certificate_arn = "arn:aws:acm:us-east-1:021114641943:certificate/b0ccb0d4-0047-4e4e-b313-07d6268f348f"

  default_action {
    target_group_arn = aws_alb_target_group.app.id
    type             = "forward"
  }
}

# Container Registry

resource "aws_ecr_repository" "readyprep-api" {
  name                 = "readyprep-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "main" {
  repository = aws_ecr_repository.readyprep-api.name
 
  policy = jsonencode({
   rules = [{
     rulePriority = 1
     description  = "keep last 25 images"
     action       = {
       type = "expire"
     }
     selection     = {
       tagStatus   = "any"
       countType   = "imageCountMoreThan"
       countNumber = 25
     }
   }]
  })
}

# Fargate service

resource "aws_ecs_cluster" "main" {
  name = "ReadyPrep"
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "readyprep-ecsTaskExecutionRole"
 
  assume_role_policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": "sts:AssumeRole",
     "Principal": {
       "Service": "ecs-tasks.amazonaws.com"
     },
     "Effect": "Allow",
     "Sid": ""
   }
 ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "ecs-task-execution-role-managed-policy-attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_policy" "getParameters" {
  name = "GetSsmParameters"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ssm:getParameters"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "ecs-task-execution-role-getParameter-policy-attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.getParameters.arn
}

resource "aws_cloudwatch_log_group" "api-logs" {
  name = "readyprep-api"
  retention_in_days = 30
}

resource "aws_ecs_task_definition" "app" {
  family                   = "api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  cpu                      = var.fargate_cpu
  memory                   = var.fargate_memory

  container_definitions = jsonencode([{
    name = "api"
    image =  "${aws_ecr_repository.readyprep-api.repository_url}:latest",
    essential   = true
    portMappings = [{
      protocol      = "tcp"
      containerPort = 3000
      hostPort      = 3000
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-region = "us-east-1"
        awslogs-group = "readyprep-api"
        awslogs-stream-prefix = "ecs"
      }
    }
    environment = [
      {
        "name": "BASE_URL",
        "value": "https://staging.readyprep.io"
      },
      { 
        "name": "TZ",
        "value": "UTC"
      }
    ]
    secrets = [
      {
        "name": "SECRET",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/app/secret"
      },
      {
        "name": "DATABASE_HOST",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/database/host"
      },
      {
        "name": "DATABASE_PASSWORD",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/database/password"
      },
      {
        "name": "GOOGLE_SIGNIN_CLIENT_ID",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/google-signin/clientId"
      },
      {
        "name": "GOOGLE_SIGNIN_CLIENT_SECRET",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/google-signin/clientSecret"
      },
      {
        "name": "MAIL_SENDGRID_API_KEY",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/sendgrid/apiKey"
      },
      {
        "name": "STRIPE_API_KEY",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/stripe/apiKey"
      },
      {
        "name": "STRIPE_ENDPOINT_SECRET",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/stripe/endpointSecret"
      },
      {
        "name": "SQUARE_APP_ID",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/square/appId"
      },
      {
        "name": "SQUARE_SECRET",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/square/secret"
      },
      {
        "name": "SQUARE_WEBHOOK_KEY",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/square/webhookKey"
      },
      {
        "name": "SQUARE_V1_WEBHOOK_KEY",
        "valueFrom": "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/square/webhookKeyV1"
      }
   ]
 }])
}

resource "aws_ecs_service" "main" {
  name            = "ReadyPrep"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.ecs_tasks.id]
    subnets         = aws_subnet.public.*.id
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.app.id
    container_name   = "api"
    container_port   = 3000
  }

  depends_on = [
    aws_alb_listener.front_end,
  ]
}

# Autoscaling

resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 6
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy_memory" {
  name               = "memory-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace
 
  target_tracking_scaling_policy_configuration {
   predefined_metric_specification {
     predefined_metric_type = "ECSServiceAverageMemoryUtilization"
   }
 
   target_value = 50
  }
}
 
resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  name               = "cpu-autoscaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace
 
  target_tracking_scaling_policy_configuration {
   predefined_metric_specification {
     predefined_metric_type = "ECSServiceAverageCPUUtilization"
   }
 
   target_value = 75
  }
}

# CloudFront (CDN)

resource "aws_s3_bucket" "cloudfront-logs" {
  bucket = "readyprep-logs-staging"
  acl    = "private"
}

resource "aws_cloudfront_distribution" "main" {

  aliases = [ "staging.readyprep.io" ]
  enabled = true
  is_ipv6_enabled = true

  viewer_certificate {
    acm_certificate_arn = "arn:aws:acm:us-east-1:021114641943:certificate/b0ccb0d4-0047-4e4e-b313-07d6268f348f"
    ssl_support_method = "sni-only"
  }

  origin {
    domain_name = aws_alb.main.dns_name
    origin_id = "ReadyPrep-Main-ALB"

    custom_origin_config {
      http_port = 80
      https_port = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = ["TLSv1.2"]
    }
  }

  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.cloudfront-logs.bucket_domain_name
    prefix          = "cloudfront"
  }

  restrictions { 
    geo_restriction { 
      restriction_type = "none"
    }
  }

  default_cache_behavior {
    allowed_methods  = [ "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT" ]
    cached_methods   = [ "GET", "HEAD" ]
    compress = true

    target_origin_id = "ReadyPrep-Main-ALB"

    forwarded_values {
      query_string = true

      headers = [ "Host" ]

      cookies {
        forward = "whitelist"
        whitelisted_names = [ "session" ]
      }
    }

    min_ttl = 0
    default_ttl = 0
    max_ttl = 0
    viewer_protocol_policy = "redirect-to-https"
  }

  ordered_cache_behavior {
    path_pattern = "/static/*"
    allowed_methods  = [ "GET", "HEAD" ]
    cached_methods   = [ "GET", "HEAD" ]
    compress = true

    target_origin_id = "ReadyPrep-Main-ALB"

    forwarded_values {
      query_string = false

      headers = [ "Host" ]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "https-only"
  }

}
