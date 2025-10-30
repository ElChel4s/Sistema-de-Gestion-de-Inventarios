package com.universidad.proyventasqr.util;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Component
public class QRGeneratorUtil {

    @Value("${app.qr.storage-path:qrs}")
    private String qrStoragePath;

    /**
     * Genera un código QR y lo guarda como un archivo en el disco
     * 
     * @param text     El texto (URL o ID) que se codificará en el QR
     * @param width    Ancho del QR
     * @param height   Alto del QR
     * @param fileName Nombre del archivo (sin extensión)
     * @return La ruta al archivo QR generado
     * @throws WriterException
     * @throws IOException
     */
    public String generateQRCodeAndSaveToFile(String text, int width, int height, String fileName)
            throws WriterException, IOException {
        // Crear directorio si no existe
        Path directoryPath = FileSystems.getDefault().getPath(qrStoragePath);
        if (!Files.exists(directoryPath)) {
            Files.createDirectories(directoryPath);
        }

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

        Path filePath = Paths.get(qrStoragePath, fileName + ".png");
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", filePath);

        return filePath.toString();
    }

    /**
     * Genera un código QR y lo devuelve como una cadena Base64
     * 
     * @param text   El texto (URL o ID) que se codificará en el QR
     * @param width  Ancho del QR
     * @param height Alto del QR
     * @return Cadena Base64 del QR generado
     * @throws WriterException
     * @throws IOException
     */
    public String generateQRCodeAsBase64(String text, int width, int height) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        byte[] pngData = outputStream.toByteArray();

        // Convertir a Base64
        return Base64.getEncoder().encodeToString(pngData);
    }
}
