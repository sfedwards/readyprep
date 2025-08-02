ENV=staging ./build.sh

aws ecr get-login-password --region us-east-1 --profile readyprep-staging | docker login --username AWS --password-stdin 021114641943.dkr.ecr.us-east-1.amazonaws.com/readyprep-api
docker tag readyprep-api-staging:latest 021114641943.dkr.ecr.us-east-1.amazonaws.com/readyprep-api:latest
docker push 021114641943.dkr.ecr.us-east-1.amazonaws.com/readyprep-api:latest

aws ecs --profile readyprep-staging update-service --cluster ReadyPrep --service ReadyPrep --force-new-deployment | cat || exit 'Error during deploymen'

