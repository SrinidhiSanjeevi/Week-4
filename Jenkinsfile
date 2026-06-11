pipeline {
    
agent any

options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
}

environment {

    DOCKER_HUB_USER = "srinidhisanjeevi"

    BACKEND_IMAGE = "${DOCKER_HUB_USER}/auth-backend:${params.IMAGE_TAG}"
    FRONTEND_IMAGE = "${DOCKER_HUB_USER}/auth-frontend:${params.IMAGE_TAG}"
}

stages {

    stage('Checkout Code') {
        steps {
            echo 'Downloading latest source code from GitHub'
            checkout scm
        }
    }

    stage('Verify Repository Structure') {
        steps {
            sh 'pwd'
            sh 'ls -la'
            sh 'ls -la backend'
            sh 'ls -la frontend'
        }
    }

    stage('Environment Validation') {
        steps {
            sh 'node -v'
            sh 'npm -v'
            sh 'docker --version'
            sh 'git --version'
        }
    }

    stage('Install Backend Dependencies') {
        steps {
            dir('backend') {
                sh 'npm install'
            }
        }
    }

    stage('Show Parameters') {
        steps {
            echo "Selected Tag: ${params.IMAGE_TAG}"
        }
    }

    stage('Optional Security Scan') {
        steps {

            catchError(
                buildResult: 'SUCCESS',
                stageResult: 'FAILURE'
            ) {

                echo 'Running Security Scan'

                dir('backend') {
                    sh 'npm audit'
                }
            }
        }
    }

    stage('Build Images') {

        parallel {

            stage('Backend Build') {

                steps {

                    echo 'Building Backend Image'

                    sh """
                    docker build \
                    -t ${BACKEND_IMAGE} \
                    backend
                    """
                }
            }

            stage('Frontend Build') {

                steps {

                    echo 'Building Frontend Image'

                    sh """
                    docker build \
                    -t ${FRONTEND_IMAGE} \
                    frontend
                    """
                }
            }
        }
    }

    stage('Verify Docker Images') {
        steps {
            sh 'docker images | grep srinidhisanjeevi'
        }
    }

    stage('Docker Hub Login') {
        steps {

            withCredentials([
                usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )
            ]) {

                sh '''
                echo "$DOCKER_PASS" | docker login \
                -u "$DOCKER_USER" \
                --password-stdin
                '''
            }
        }
    }

    stage('Push Images') {

        parallel {

            stage('Push Backend') {

                steps {

                    script {

                        try {

                            echo 'Pushing Backend Image'

                            sh """
                            docker push ${BACKEND_IMAGE}
                            """

                        } catch(Exception e) {

                            echo 'Backend Push Failed'
                        }
                    }
                }
            }

            stage('Push Frontend') {

                steps {

                    script {

                        try {

                            echo 'Pushing Frontend Image'

                            sh """
                            docker push ${FRONTEND_IMAGE}
                            """

                        } catch(Exception e) {

                            echo 'Frontend Push Failed'
                        }
                    }
                }
            }
        }
    }
}

post {

    success {
        echo 'Pipeline completed successfully'
    }

    failure {
        echo 'Pipeline failed'
    }

    always {

        sh 'docker logout || true'

        echo 'Pipeline execution finished'
    }
}


}