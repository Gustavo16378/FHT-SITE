# Imagem de produção em modo JVM, em dois estágios. Também é a imagem do docker compose local.
#
# Tentou-se o build NATIVO (GraalVM/Mandrel 23.1, Quarkus 3.15.1) e ele falha numa dependência
# incompatível: o AWS SDK v2 usado pro Cloudflare R2. As classes Crc32Checksum/Crc32CChecksum do
# módulo http-auth-aws referenciam software.amazon.awssdk.crt.checksums.CRC32 (biblioteca
# opcional aws-crt, ausente) e o --link-at-build-time que o Quarkus impõe recusa o tipo não
# resolvido. Sair disso exigiria a extensão Quarkiverse do S3 ou substituições GraalVM — fora do
# escopo do MVP. Decisão: JVM enxuta, dimensionada pro free tier do Render (512 MB).
#
# O build roda no GitHub Actions (.github/workflows/deploy.yml); o Render só puxa a imagem.

# ── Estágio 1: build ─────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -q

COPY src/ src/
RUN mvn package -DskipTests -q

# ── Estágio 2: runtime ───────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/quarkus-app/lib/ lib/
COPY --from=builder /app/target/quarkus-app/*.jar ./
COPY --from=builder /app/target/quarkus-app/app/ app/
COPY --from=builder /app/target/quarkus-app/quarkus/ quarkus/

# Heap curto, GC serial e só o compilador C1: menos memória e CPU no free tier do Render.
ENV JAVA_OPTS="-Xmx256m -XX:+UseSerialGC -XX:TieredStopAtLevel=1"

# O Render injeta PORT; application.properties lê quarkus.http.port=${PORT:8080}.
ENV PORT=8080
EXPOSE 8080

# "exec" pra o java ser o PID 1 e receber o SIGTERM do Render no redeploy (parada limpa).
CMD exec java $JAVA_OPTS -Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager -jar quarkus-run.jar
