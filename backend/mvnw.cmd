@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET "MVN_CMD=mvn") ELSE (SET "MVN_CMD=%__MVNW_ARG0_NAME__%")
@SET MAVEN_PROJECTBASEDIR=%~dp0
@SET MAVEN_WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar
@SET MAVEN_WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties

@IF NOT "%MVNW_VERBOSE%"=="" (
  @echo Maven Wrapper Properties: %MAVEN_WRAPPER_PROPERTIES%
)

@FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_WRAPPER_PROPERTIES%") DO (
  @IF "%%A"=="distributionUrl" SET DISTRIBUTION_URL=%%B
)

@SET JAVA_HOME_OPTION=
@IF NOT "%JAVA_HOME%"=="" SET "JAVA_HOME_OPTION=-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%"

@IF NOT EXIST "%MAVEN_WRAPPER_JAR%" (
  @powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $url = '%DISTRIBUTION_URL%'; $dest = '%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\'; if (-not (Test-Path $dest)) { New-Item -ItemType Directory $dest | Out-Null }; $file = Join-Path $dest 'apache-maven.zip'; Invoke-WebRequest -Uri $url -OutFile $file; Expand-Archive -Path $file -DestinationPath $dest -Force; Remove-Item $file }"
)

@SET MVN_CMD=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\apache-maven\bin\mvn.cmd
@IF NOT EXIST "%MVN_CMD%" (
  FOR /D %%D IN ("%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\apache-maven-*") DO SET "MVN_CMD=%%D\bin\mvn.cmd"
)

@"%MVN_CMD%" %*
