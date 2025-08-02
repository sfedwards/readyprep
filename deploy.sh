ENV=prod ./build.sh

aws ecr get-login-password --region us-east-1 --profile readyprep-prod | docker login --username AWS --password-stdin 380250243476.dkr.ecr.us-east-1.amazonaws.com/readyprep-api
docker tag readyprep-api-prod:latest 380250243476.dkr.ecr.us-east-1.amazonaws.com/readyprep-api:latest
docker push 380250243476.dkr.ecr.us-east-1.amazonaws.com/readyprep-api:latest

aws ecs --profile readyprep-prod update-service --cluster ReadyPrep --service ReadyPrep --force-new-deployment | cat || exit 'Error during deploymen'

