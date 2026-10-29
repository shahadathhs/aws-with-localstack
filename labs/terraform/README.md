# Terraform lab

The working directory for the Terraform lessons. Terraform runs in Docker, so there is nothing to install:

```sh
make up                    # LocalStack must be running
make tf CMD="version"      # first run pulls the image
make tf CMD="init"
make tf CMD="plan"
```

Files you create here while following the lessons (`main.tf`, state, the `.terraform` folder) are git-ignored.
