pipeline {
    agent any

    environment {
        GIT_REPO = 'https://github.com/joshlopez07/meli-test-url-shortener.git'
        BRANCH = 'main'
        GITHUB_CREDENTIALS = 'github_credentials'
        OWASP_REPORT_PATH = 'owasp-report.html'
        JAVA_HOME = '/usr/lib/jvm/java-17-openjdk-amd64'
        SONAR_PROJECT_KEY = 'joshlopez07_meli-test-url-shortener'
        SONAR_ORG = 'Joseph_Lopez'
        DOCKER_IMAGE = "us-central1-docker.pkg.dev/doaas-project/doaas/meli-test:0.0.3" // Repositorio en GCR de Google Cloud
        //DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        GOOGLE_APPLICATION_CREDENTIALS = 'gcp-credentials-json' // ID del archivo de credenciales de GCP en Jenkins
        GCP_PROJECT = 'doaas-project' // Reemplaza con tu ID de proyecto en GCP
        GCP_REGION = 'us-central1' // Región donde desplegar Cloud Run
        SERVICE_NAME = 'meli-test' // Nombre del servicio en Cloud Run
        NVD_API_KEY = 'c04ad272-f369-4fc3-9171-820a44bfb756'
        JMETER_HOME = '/opt/jmeter'  // Ruta donde está instalado JMeter
        JMETER_JMX = 'meli-test.jmx'                // Nombre del archivo .jmx
        RESULTS_DIR = 'jmeter_results'
        PATH = "${env.JAVA_HOME}/bin:${env.PATH}:${env.WORKSPACE}/sonar-scanner/bin"
        //PATH = "${env.PATH}:${env.WORKSPACE}/sonar-scanner/bin"
    }

    tools {
        nodejs 'NodeJS_20.15.0'
    }

    stages {
        /*stage('Install SonarScanner') {
            steps {
                script {
                    sh '''
                        # Descargar la última versión de SonarScanner
                        wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.6.2.2472-linux.zip
                        
                        # Extraer el archivo descargado
                        unzip sonar-scanner-cli-4.6.2.2472-linux.zip
                        
                        # Mover el SonarScanner a una ubicación estándar
                        mv sonar-scanner-4.6.2.2472-linux sonar-scanner

                        # Establecer permisos de ejecución
                        chmod +x sonar-scanner/bin/sonar-scanner

                        # Agregar SonarScanner al PATH temporalmente
                        export PATH=$PATH:`pwd`/sonar-scanner/bin

                        # Verificar la instalación de SonarScanner
                        sonar-scanner --version
                    '''
                }
            }
        }*/

        stage('Verify Tools') {
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'sonar-scanner -v'
                sh 'echo "Java Home: $JAVA_HOME"'
                sh 'java -version'
            }
        }
        stage('Clone Code') {
            steps {
                // Clona el repositorio de GitHub usando las credenciales
                git branch: "${BRANCH}", url: "${GIT_REPO}", credentialsId: "${GITHUB_CREDENTIALS}"
            }
        }

        stage('Install Dependencies') {
            steps {
                // Instala las dependencias de Node.js
                sh 'npm install'
            }
        }

        /*stage('Run Unit Tests') {
            steps {
                // Ejecuta las pruebas unitarias
                sh 'npm test'
            }
        }*/

        stage('Test OWASP') {
            steps {
                /*withEnv(['NVD_API_KEY=c04ad272-f369-4fc3-9171-820a44bfb756']) {
                sh '''
                    # Eliminar cualquier directorio existente de dependency-check para evitar conflictos
                    rm -rf dependency-check

                    # Descargar e instalar dependency-check
                    wget https://github.com/jeremylong/DependencyCheck/releases/download/v6.5.3/dependency-check-6.5.3-release.zip
                    
                    # Descomprimir el archivo ZIP y configurar permisos
                    unzip -o dependency-check-6.5.3-release.zip
                    chmod +x dependency-check/bin/dependency-check.sh

                    # Ejecutar npm audit para verificar vulnerabilidades en Node.js
                    npm audit --audit-level=high

                    # Ejecutar dependency-check sin la opción --nvdApiKey
                    ./dependency-check/bin/dependency-check.sh --project "meli-test" --out ./dependency-check-report.html --scan ./ --format ALL --prettyPrint
                '''
                }
                // Instalar dependency-check de forma dinámica en Jenkins
                sh '''
                    # Eliminar cualquier directorio existente de dependency-check para evitar conflictos
                    rm -rf dependency-check

                    # Descargar e instalar dependency-check
                    wget https://github.com/jeremylong/DependencyCheck/releases/download/v6.5.3/dependency-check-6.5.3-release.zip

                    # Descomprimir el archivo ZIP y listar la estructura de directorios
                    unzip -o dependency-check-6.5.3-release.zip
                    echo "Contenido del directorio después de la descompresión:"
                    ls -R dependency-check

                    # Asegurarse de que el binario tenga permisos de ejecución
                    chmod +x dependency-check/bin/dependency-check || true
                    export PATH=$PATH:`pwd`/dependency-check/bin
                    echo "PATH actualizado: $PATH"
                '''

                // Verificar los permisos y la existencia del binario
                sh 'ls -la dependency-check/bin'

                sh 'npm audit --audit-level=high'  // Realiza un escaneo de seguridad con npm audit
                // Si tienes OWASP Dependency Check configurado para Node.js, puedes agregar lo siguiente
                //sh './dependency-check/bin/dependency-check --project "meli-test" --out ./dependency-check-report.html --scan ./ --nvdApiKey ${NVD_API_KEY}'
                // Ejecutar dependency-check usando el script dependency-check.sh
                sh '''
                    if [ -f "dependency-check/bin/dependency-check.sh" ]; then
                        ./dependency-check/bin/dependency-check.sh --project "meli-test" --out ./dependency-check-report.html --scan ./ --nvdApiKey ${NVD_API_KEY}
                    else
                        echo "El script dependency-check.sh no se encontró en la ubicación esperada."
                    fi
                '''*/
                sh 'npm audit --audit-level=high'  // Realiza un escaneo de seguridad con npm audit
                dependencyCheck additionalArguments: ''' 
                    -o './'
                    -s './'
                    -f 'ALL' 
                    --prettyPrint
                ''', odcInstallation: 'OWASP Dependency-Check Vulnerabilities'
                dependencyCheckPublisher pattern: 'dependency-check-report.xml'
                // Opcional: Realiza un análisis de seguridad con OWASP Dependency-Check
                //sh "dependency-check --project 'NodeApp' --format 'ALL' --out './owasp-report' --scan './' --nvd-api-key ${NVD_API_KEY}"
            }
        }

        stage('Code Review with SonarQube') {
            steps {
                script {
                    withSonarQubeEnv('SonarCloud') {
                        sh '''
                            export JAVA_HOME=${JAVA_HOME}
                            export PATH=${JAVA_HOME}/bin:${PATH}
                            sonar-scanner -Dsonar.projectKey=${SONAR_PROJECT_KEY} -Dsonar.organization=${SONAR_ORG} -Dsonar.sources=./ -Dsonar.host.url=https://sonarcloud.io -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Construye la imagen de Docker del proyecto
                    sh 'docker build -t meli-test:0.0.3 .'
                    // Etiqueta la imagen para Google Container Registry
                    sh "docker tag meli-test:0.0.3 ${DOCKER_IMAGE}"
                }
            }
        }

        stage('Push Docker Image to Google Container Registry') {
            steps {
                script {
                    // Autenticarse con GCP usando las credenciales en el archivo JSON
                    withCredentials([file(credentialsId: "${GOOGLE_APPLICATION_CREDENTIALS}", variable: 'GOOGLE_CREDENTIALS')]) {
                        sh 'gcloud auth activate-service-account --key-file=$GOOGLE_CREDENTIALS'
                        sh 'gcloud auth configure-docker'
                    }

                    // Empuja la imagen a Google Container Registry (GCR)
                    sh "docker push ${DOCKER_IMAGE}"
                }
            }
        }

        stage('Deploy to Cloud Run') {
            steps {
                script {
                    // Autenticarse con GCP usando las credenciales en el archivo JSON
                    withCredentials([file(credentialsId: "${GOOGLE_APPLICATION_CREDENTIALS}", variable: 'GOOGLE_CREDENTIALS')]) {
                        sh 'gcloud auth activate-service-account --key-file=$GOOGLE_CREDENTIALS'
                    }
                    
                    // Establecer el proyecto de GCP
                    sh "gcloud config set project ${GCP_PROJECT}"
                    
                    // Desplegar la imagen en Cloud Run
                    sh """
                        gcloud run deploy ${SERVICE_NAME} \
                        --image=${DOCKER_IMAGE} \
                        --region=${GCP_REGION} \
                        --platform=managed \
                        --allow-unauthenticated
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed with status: ' + currentBuild.currentResult
        }
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}