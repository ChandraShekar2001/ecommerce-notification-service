namespace = "production"
serviceName = "ecom-notif"
service = "ecommerce Notification"

def groovyMethods

m1 = System.currentTimeMillis()

pipeline {
  agent {
    label 'Jenkins-Agent'
  }

  tools {
    nodejs "NodeJS"
    dockerTool "Docker"
  }

  environment {
    DOCKER_CREDENTIALS = credentials("dockerhub")
    IMAGE_NAME = "pvchandu07622" + "/" + "ecommerce-notification"
    IMAGE_TAG = "stable-${BUILD_NUMBER}"
  }

  stages {
    stage("Cleanup Workspace") {
      steps {
        cleanWs()
      }
    }

    stage("Prepare Environment") {
      steps {
        sh "[ -d pipeline ] || mkdir pipeline"
        dir("pipeline") {
          // Add your jenkins automation url to url field
          git branch: 'main', credentialsId: 'github', url: 'https://github.com/ChandraShekar2001/jenkins-automation'
          script {
            groovyMethods = load("functions.groovy")
          }
        }
        // Add your notification github url to url field
        git branch: 'main', credentialsId: 'github', url: 'https://github.com/ChandraShekar2001/ecommerce-review-service'
        withCredentials([string(credentialsId: 'npm-token', variable: 'NPM_TOKEN')]) {
            sh '''
                echo "@ChandraShekar2001:registry=https://npm.pkg.github.com" > .npmrc
                echo "//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc
                npm install
            '''
        }
      }
    }

    stage("Build and Push") {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', passwordVariable: 'DOCKERHUB_CREDENTIALS_PSW', usernameVariable: 'DOCKERHUB_CREDENTIAL_USR')]) {
          sh 'docker login -u $DOCKERHUB_CREDENTIAL_USR --password $DOCKERHUB_CREDENTIALS_PSW'
          sh "docker build -t $IMAGE_NAME ."
          sh "docker tag $IMAGE_NAME $IMAGE_NAME:$IMAGE_TAG"
          sh "docker tag $IMAGE_NAME $IMAGE_NAME:stable"
          sh "docker push $IMAGE_NAME:$IMAGE_TAG"
          sh "docker push $IMAGE_NAME:stable"
        }
      }
    }

    stage("Clean Artifacts") {
      steps {
        sh "docker rmi $IMAGE_NAME:$IMAGE_TAG"
        sh "docker rmi $IMAGE_NAME:stable"
      }
    }

    stage("Create New Pods") {
      steps {
        withKubeCredentials(kubectlCredentials: [[caCertificate: '', clusterName: 'minikube', contextName: 'minikube', credentialsId: 'jenkins-k8s-token', namespace: '', serverUrl: 'https://192.168.105.22:8443']]) {
          script {
            def pods = groovyMethods.findPodsFromName("${namespace}", "${serviceName}")
            for (podName in pods) {
              sh """
                kubectl delete -n ${namespace} pod ${podName}
                sleep 10s
              """
            }
          }
        }
      }
    }
  }
}