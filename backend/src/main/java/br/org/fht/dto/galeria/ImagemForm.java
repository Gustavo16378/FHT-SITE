package br.org.fht.dto.galeria;

import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

@Schema(description = "Upload de imagem da galeria")
public class ImagemForm {

    @RestForm("file")
    @Schema(description = "Arquivo de imagem (JPG/PNG, máx. 5 MB)", required = true)
    public FileUpload file;
}
