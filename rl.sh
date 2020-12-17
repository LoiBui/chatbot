if [ "$1" = "first" ]; then
    gcloud app deploy ./src/app.yaml ./src/queue.yaml ./src/cron.yaml
else
    gcloud app deploy ./src/app.yaml
fi