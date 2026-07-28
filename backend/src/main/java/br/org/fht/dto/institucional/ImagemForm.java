package br.org.fht.dto.institucional;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@Schema(description = "Upload de arquivo institucional (foto de diretor ou PDF de documento)")
public class ImagemForm {

    @RestForm("file")
    @Schema(description = "Arquivo (imagem JPG/PNG ou PDF, máx. 10 MB)", required = true)
    public FileUpload file;
}
