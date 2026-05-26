package br.org.fht.service;

import br.org.fht.model.Usuario;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.util.Set;

@ApplicationScoped
public class JwtService {

    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String issuer;

    public String generateToken(Usuario usuario) {
        var builder = Jwt.issuer(issuer)
                .upn(usuario.getEmail())
                .groups(Set.of(usuario.getRole().name()))
                .claim("sub", usuario.getId().toString())
                .claim("name", usuario.getNome())
                .claim("role", usuario.getRole().name())
                .expiresIn(Duration.ofDays(1));

        if (usuario.getClubeId() != null) {
            builder.claim("clubeId", usuario.getClubeId().toString());
        }

        return builder.sign();
    }

    public String generateRefreshToken(Usuario usuario) {
        return Jwt.issuer(issuer)
                .upn(usuario.getEmail())
                .claim("sub", usuario.getId().toString())
                .claim("type", "refresh")
                .expiresIn(Duration.ofDays(30))
                .sign();
    }
}
