package com.universidad.proyventasqr.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.universidad.proyventasqr.dto.MovimientoDTO;
import com.universidad.proyventasqr.model.Almacen;
import com.universidad.proyventasqr.model.DetalleMovimiento;
import com.universidad.proyventasqr.model.Movimiento;
import com.universidad.proyventasqr.model.Producto;
import com.universidad.proyventasqr.repository.AlmacenRepository;
import com.universidad.proyventasqr.repository.DetalleMovimientoRepository;
import com.universidad.proyventasqr.repository.MovimientoRepository;
import com.universidad.proyventasqr.repository.ProductoRepository;
import com.universidad.proyventasqr.service.IMovimientoService;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Cell;
import java.io.ByteArrayOutputStream;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.layout.properties.TextAlignment;
import com.universidad.proyventasqr.dto.DetalleMovimientoDTO;

@Service
public class MovimientoServiceImpl implements IMovimientoService {
    @Autowired
    private MovimientoRepository movimientoRepository;
    @Autowired
    private AlmacenRepository almacenRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private com.universidad.proyventasqr.repository.UsuarioRepository usuarioRepository;
    @Autowired
    private com.universidad.proyventasqr.repository.InventarioRepository inventarioRepository;
    @Autowired
    private com.universidad.proyventasqr.repository.DetalleMovimientoRepository detalleMovimientoRepository;

    @Override
    public List<MovimientoDTO> obtenerTodosLosMovimientos() {
        List<Movimiento> movimientos = movimientoRepository.findAll();

        // Cargar detalles para cada movimiento
        for (Movimiento movimiento : movimientos) {
            // Cargar los detalles de movimiento
            List<DetalleMovimiento> detalles = detalleMovimientoRepository.findByMovimientoId(movimiento.getId());
            movimiento.setProductos(detalles);
        }

        return movimientos.stream().map(movimiento -> {
            MovimientoDTO dto = modelMapper.map(movimiento, MovimientoDTO.class);
            // Mapear manualmente los detalles
            if (movimiento.getProductos() != null) {
                List<com.universidad.proyventasqr.dto.DetalleMovimientoDTO> detallesDTO = movimiento.getProductos()
                        .stream()
                        .map(detalle -> modelMapper.map(detalle,
                                com.universidad.proyventasqr.dto.DetalleMovimientoDTO.class))
                        .collect(Collectors.toList());
                dto.setDetalles(detallesDTO);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MovimientoDTO crearMovimiento(MovimientoDTO movimientoDTO) {
        Movimiento movimiento = modelMapper.map(movimientoDTO, Movimiento.class);
        // Asignar almacenes según el tipo de movimiento
        if ("ENTRADA".equalsIgnoreCase(movimientoDTO.getTipoMov())) {
            if (movimientoDTO.getAlmacenDestino() == null || movimientoDTO.getAlmacenDestino().getIdAlm() == null) {
                throw new IllegalArgumentException("Debe ingresar un almacén destino válido");
            }
            Almacen destino = almacenRepository.findById(movimientoDTO.getAlmacenDestino().getIdAlm())
                    .orElseThrow(() -> new RuntimeException("El almacén destino no existe"));
            movimiento.setAlmacenDestino(destino);
        } else if ("SALIDA".equalsIgnoreCase(movimientoDTO.getTipoMov())) {
            if (movimientoDTO.getAlmacenOrigen() == null || movimientoDTO.getAlmacenOrigen().getIdAlm() == null) {
                throw new IllegalArgumentException("Debe ingresar un almacén origen válido");
            }
            Almacen origen = almacenRepository.findById(movimientoDTO.getAlmacenOrigen().getIdAlm())
                    .orElseThrow(() -> new RuntimeException("El almacén origen no existe"));
            movimiento.setAlmacenOrigen(origen);
        } else if ("TRASPASO".equalsIgnoreCase(movimientoDTO.getTipoMov())) {
            if (movimientoDTO.getAlmacenOrigen() == null || movimientoDTO.getAlmacenDestino() == null
                    || movimientoDTO.getAlmacenOrigen().getIdAlm() == null
                    || movimientoDTO.getAlmacenDestino().getIdAlm() == null) {
                throw new IllegalArgumentException("Debe especificar almacén origen y destino para traspaso");
            }
            Almacen origen = almacenRepository.findById(movimientoDTO.getAlmacenOrigen().getIdAlm())
                    .orElseThrow(() -> new RuntimeException("Almacén origen no encontrado"));
            Almacen destino = almacenRepository.findById(movimientoDTO.getAlmacenDestino().getIdAlm())
                    .orElseThrow(() -> new RuntimeException("Almacén destino no encontrado"));
            movimiento.setAlmacenOrigen(origen);
            movimiento.setAlmacenDestino(destino);
        }
        // Procesar detalles si vienen en el DTO
        if (movimientoDTO.getDetalles() != null && !movimientoDTO.getDetalles().isEmpty()) {
            List<DetalleMovimiento> detalles = movimientoDTO.getDetalles().stream().map(detDTO -> {
                DetalleMovimiento det = new DetalleMovimiento();
                det.setMovimiento(movimiento);
                det.setCantidad(detDTO.getCantidad());
                if (detDTO.getProducto() == null || detDTO.getProducto().getIdProd() == null)
                    throw new IllegalArgumentException("Producto requerido en detalle");
                Producto producto = productoRepository.findById(detDTO.getProducto().getIdProd())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                det.setProducto(producto);
                return det;
            }).collect(java.util.stream.Collectors.toList());
            movimiento.setProductos(detalles);
        }
        // Asignar fecha automática si no viene en el DTO
        if (movimiento.getFecha() == null) {
            movimiento.setFecha(java.time.LocalDate.now());
        }
        Movimiento guardarMovimiento = movimientoRepository.save(movimiento);
        return modelMapper.map(guardarMovimiento, MovimientoDTO.class);

    }

    @Override
    public MovimientoDTO obtenerMovimientoPorId(Long id) {
        System.out.println("DEBUG: Obteniendo movimiento con ID: " + id);

        // Verificar si el movimiento existe
        if (!movimientoRepository.existsById(id)) {
            System.err.println("ERROR: El movimiento con ID " + id + " no existe en la base de datos");
            throw new RuntimeException("El movimiento con ID: " + id + " no existe");
        }

        Movimiento movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El movimiento con ID: " + id + " no existe"));

        System.out.println("DEBUG: Movimiento encontrado - Tipo: " + movimiento.getTipoMov() +
                " - Fecha: " + movimiento.getFecha() +
                " - Usuario: " + movimiento.getUsuarioMov());

        // Cargar los detalles de movimiento
        List<DetalleMovimiento> detalles = detalleMovimientoRepository.findByMovimientoId(movimiento.getId());
        System.out.println("DEBUG: Detalles encontrados para movimiento " + id + ": " + detalles.size());

        movimiento.setProductos(detalles);

        MovimientoDTO dto = modelMapper.map(movimiento, MovimientoDTO.class);
        System.out.println("DEBUG: DTO mapeado - ID: " + dto.getId() + " - Tipo: " + dto.getTipoMov());

        // Mapear manualmente los detalles
        if (movimiento.getProductos() != null) {
            List<com.universidad.proyventasqr.dto.DetalleMovimientoDTO> detallesDTO = movimiento.getProductos()
                    .stream()
                    .map(detalle -> {
                        System.out.println("DEBUG: Mapeando detalle - Producto: " +
                                (detalle.getProducto() != null ? detalle.getProducto().getNombre() : "NULL") +
                                " - Cantidad: " + detalle.getCantidad());
                        return modelMapper.map(detalle,
                                com.universidad.proyventasqr.dto.DetalleMovimientoDTO.class);
                    })
                    .collect(Collectors.toList());
            dto.setDetalles(detallesDTO);
            System.out.println("DEBUG: Detalles mapeados: " + detallesDTO.size());
        } else {
            System.out.println("DEBUG: No hay productos en el movimiento");
        }

        return dto;
    }

    @Override
    @Transactional
    public MovimientoDTO actualizarMovimiento(Long id, MovimientoDTO movimientoDTO) {
        Movimiento movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El movimiento con ID: " + id + " no existe"));
        // Eliminar lógica de actualización de almacen en actualizarMovimiento
        // if(!movimiento.getAlmacen().getId().equals(movimientoDTO.getAlmacen().getIdAlm())){
        // Almacen nuevoAlmacen =
        // almacenRepository.findById(movimientoDTO.getAlmacen().getIdAlm()).orElseThrow(()->new
        // RuntimeException("El almacen con ID:"+movimientoDTO.getAlmacen().getIdAlm()+"
        // no existe"));
        // movimiento.setAlmacen(nuevoAlmacen);
        // }
        // Ahora solo actualizar origen/destino si aplica
        if ("ENTRADA".equalsIgnoreCase(movimientoDTO.getTipoMov())) {
            if (movimientoDTO.getAlmacenDestino() != null && movimientoDTO.getAlmacenDestino().getIdAlm() != null) {
                Almacen destino = almacenRepository.findById(movimientoDTO.getAlmacenDestino().getIdAlm())
                        .orElseThrow(() -> new RuntimeException("El almacén destino no existe"));
                movimiento.setAlmacenDestino(destino);
            }
        }
        if ("SALIDA".equalsIgnoreCase(movimientoDTO.getTipoMov())) {
            if (movimientoDTO.getAlmacenOrigen() != null && movimientoDTO.getAlmacenOrigen().getIdAlm() != null) {
                Almacen origen = almacenRepository.findById(movimientoDTO.getAlmacenOrigen().getIdAlm())
                        .orElseThrow(() -> new RuntimeException("El almacén origen no existe"));
                movimiento.setAlmacenOrigen(origen);
            }
        }
        if ("TRASPASO".equalsIgnoreCase(movimientoDTO.getTipoMov())) {
            if (movimientoDTO.getAlmacenOrigen() != null && movimientoDTO.getAlmacenOrigen().getIdAlm() != null) {
                Almacen origen = almacenRepository.findById(movimientoDTO.getAlmacenOrigen().getIdAlm())
                        .orElseThrow(() -> new RuntimeException("Almacén origen no encontrado"));
                movimiento.setAlmacenOrigen(origen);
            }
            if (movimientoDTO.getAlmacenDestino() != null && movimientoDTO.getAlmacenDestino().getIdAlm() != null) {
                Almacen destino = almacenRepository.findById(movimientoDTO.getAlmacenDestino().getIdAlm())
                        .orElseThrow(() -> new RuntimeException("Almacén destino no encontrado"));
                movimiento.setAlmacenDestino(destino);
            }
        }
        movimiento.setTipoMov(movimientoDTO.getTipoMov());
        movimiento.setFecha(movimientoDTO.getFecha());
        movimiento.setUsuarioMov(movimientoDTO.getUsuarioMov());
        movimiento.setEstado(movimientoDTO.getEstado());
        Movimiento updateMov = movimientoRepository.save(movimiento);
        return modelMapper.map(updateMov, MovimientoDTO.class);
    }

    @Override
    @Transactional
    public void eliminarMovimiento(Long id) {
        Movimiento movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("El movimiento con ID: " + id + " no existe"));
        movimientoRepository.delete(movimiento);
    }

    @Override
    @Transactional
    public MovimientoDTO crearMovimientoConUsuario(MovimientoDTO movimientoDTO, String username) {
        Movimiento movimiento = modelMapper.map(movimientoDTO, Movimiento.class);
        // Eliminar referencias a 'almacen' y usar solo almacenOrigen/almacenDestino
        // if (movimientoDTO.getAlmacen() == null ||
        // movimientoDTO.getAlmacen().getIdAlm() == null){
        // throw new IllegalArgumentException("Debe ingresar un almacen valido");
        // }
        // Almacen almacen =
        // almacenRepository.findById(movimientoDTO.getAlmacen().getIdAlm())
        // .orElseThrow(() -> new RuntimeException("El almacen con ID: " +
        // movimientoDTO.getAlmacen().getIdAlm() + " no existe"));
        // movimiento.setAlmacen(almacen);
        // Asignar usuario autenticado
        com.universidad.proyventasqr.model.Usuario usuario = usuarioRepository.findByNombreUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
        movimiento.setUsuario(usuario);
        movimiento.setUsuarioMov(username); // Opcional: también en campo usuarioMov
        // Asignar almacenes origen/destino en la entidad para que se persistan en la BD
        if ("ENTRADA".equalsIgnoreCase(movimiento.getTipoMov())) {
            if (movimientoDTO.getAlmacenDestino() == null || movimientoDTO.getAlmacenDestino().getIdAlm() == null) {
                throw new IllegalArgumentException("Debe ingresar un almacén destino válido");
            }
            Almacen destino = almacenRepository.findById(movimientoDTO.getAlmacenDestino().getIdAlm())
                    .orElseThrow(() -> new RuntimeException("El almacén destino no existe"));
            movimiento.setAlmacenDestino(destino);
        }
        if ("SALIDA".equalsIgnoreCase(movimiento.getTipoMov())) {
            if (movimientoDTO.getAlmacenOrigen() == null || movimientoDTO.getAlmacenOrigen().getIdAlm() == null) {
                throw new IllegalArgumentException("Debe ingresar un almacén origen válido");
            }
            Almacen origen = almacenRepository.findById(movimientoDTO.getAlmacenOrigen().getIdAlm())
                    .orElseThrow(() -> new RuntimeException("El almacén origen no existe"));
            movimiento.setAlmacenOrigen(origen);
        }
        if ("TRASPASO".equalsIgnoreCase(movimiento.getTipoMov())) {
            if (movimientoDTO.getAlmacenOrigen() == null || movimientoDTO.getAlmacenDestino() == null
                    || movimientoDTO.getAlmacenOrigen().getIdAlm() == null
                    || movimientoDTO.getAlmacenDestino().getIdAlm() == null) {
                throw new IllegalArgumentException("Debe especificar almacén origen y destino para traspaso");
            }
            Almacen origen = almacenRepository.findById(movimientoDTO.getAlmacenOrigen().getIdAlm())
                    .orElseThrow(() -> new RuntimeException("Almacén origen no encontrado"));
            Almacen destino = almacenRepository.findById(movimientoDTO.getAlmacenDestino().getIdAlm())
                    .orElseThrow(() -> new RuntimeException("Almacén destino no encontrado"));
            movimiento.setAlmacenOrigen(origen);
            movimiento.setAlmacenDestino(destino);
        }
        // Procesar detalles si vienen en el DTO
        if (movimientoDTO.getDetalles() != null && !movimientoDTO.getDetalles().isEmpty()) {
            List<DetalleMovimiento> detalles = movimientoDTO.getDetalles().stream().map(detDTO -> {
                DetalleMovimiento det = new DetalleMovimiento();
                det.setMovimiento(movimiento);
                det.setCantidad(detDTO.getCantidad());
                if (detDTO.getProducto() == null || detDTO.getProducto().getIdProd() == null)
                    throw new IllegalArgumentException("Producto requerido en detalle");
                Producto producto = productoRepository.findById(detDTO.getProducto().getIdProd())
                        .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
                det.setProducto(producto);
                // --- ACTUALIZAR INVENTARIO SEGÚN TIPO DE MOVIMIENTO ---
                if ("ENTRADA".equalsIgnoreCase(movimientoDTO.getTipoMov())) {
                    Almacen destinoInventario = movimiento.getAlmacenDestino();
                    com.universidad.proyventasqr.model.Inventario inventario = inventarioRepository
                            .findByAlmacen_Id(destinoInventario.getId()).stream()
                            .filter(inv -> inv.getProducto().getIdProd().equals(producto.getIdProd()))
                            .findFirst()
                            .orElse(null);
                    if (inventario == null) {
                        inventario = new com.universidad.proyventasqr.model.Inventario();
                        inventario.setAlmacen(destinoInventario);
                        inventario.setProducto(producto);
                        inventario.setCantidad(det.getCantidad());
                        inventario.setActualizadoEn(java.time.LocalDateTime.now());
                    } else {
                        inventario.setCantidad(inventario.getCantidad().add(det.getCantidad()));
                        inventario.setActualizadoEn(java.time.LocalDateTime.now());
                    }
                    inventarioRepository.save(inventario);
                } else if ("SALIDA".equalsIgnoreCase(movimientoDTO.getTipoMov())) {
                    Almacen origenInventario = movimiento.getAlmacenOrigen();
                    com.universidad.proyventasqr.model.Inventario inventario = inventarioRepository
                            .findByAlmacen_Id(origenInventario.getId()).stream()
                            .filter(inv -> inv.getProducto().getIdProd().equals(producto.getIdProd()))
                            .findFirst()
                            .orElse(null);
                    if (inventario == null || inventario.getCantidad().compareTo(det.getCantidad()) < 0) {
                        throw new RuntimeException("Stock insuficiente para el producto " + producto.getNombre());
                    }
                    inventario.setCantidad(inventario.getCantidad().subtract(det.getCantidad()));
                    inventario.setActualizadoEn(java.time.LocalDateTime.now());
                    inventarioRepository.save(inventario);
                } else if ("TRASPASO".equalsIgnoreCase(movimientoDTO.getTipoMov())) {
                    Almacen origenInventario = movimiento.getAlmacenOrigen();
                    Almacen destinoInventario = movimiento.getAlmacenDestino();
                    // Restar del origen
                    com.universidad.proyventasqr.model.Inventario invOrigen = inventarioRepository
                            .findByAlmacen_Id(origenInventario.getId()).stream()
                            .filter(inv -> inv.getProducto().getIdProd().equals(producto.getIdProd()))
                            .findFirst()
                            .orElse(null);
                    if (invOrigen == null || invOrigen.getCantidad().compareTo(det.getCantidad()) < 0) {
                        throw new RuntimeException(
                                "Stock insuficiente en almacén origen para el producto " + producto.getNombre());
                    }
                    invOrigen.setCantidad(invOrigen.getCantidad().subtract(det.getCantidad()));
                    invOrigen.setActualizadoEn(java.time.LocalDateTime.now());
                    inventarioRepository.save(invOrigen);
                    // Sumar al destino
                    com.universidad.proyventasqr.model.Inventario invDestino = inventarioRepository
                            .findByAlmacen_Id(destinoInventario.getId()).stream()
                            .filter(inv -> inv.getProducto().getIdProd().equals(producto.getIdProd()))
                            .findFirst()
                            .orElse(null);
                    if (invDestino == null) {
                        invDestino = new com.universidad.proyventasqr.model.Inventario();
                        invDestino.setAlmacen(destinoInventario);
                        invDestino.setProducto(producto);
                        invDestino.setCantidad(det.getCantidad());
                        invDestino.setActualizadoEn(java.time.LocalDateTime.now());
                    } else {
                        invDestino.setCantidad(invDestino.getCantidad().add(det.getCantidad()));
                        invDestino.setActualizadoEn(java.time.LocalDateTime.now());
                    }
                    inventarioRepository.save(invDestino);
                }
                // --- FIN ACTUALIZAR INVENTARIO ---
                return det;
            }).collect(java.util.stream.Collectors.toList());
            movimiento.setProductos(detalles);
        }
        // Asignar fecha automática si no viene en el DTO
        if (movimiento.getFecha() == null) {
            movimiento.setFecha(java.time.LocalDate.now());
        }
        Movimiento guardarMovimiento = movimientoRepository.save(movimiento);
        MovimientoDTO result = modelMapper.map(guardarMovimiento, MovimientoDTO.class);
        // Asegurar que los IDs de almacenOrigen y almacenDestino estén correctamente
        // mapeados
        if (result.getAlmacenOrigen() != null && guardarMovimiento.getAlmacenOrigen() != null) {
            result.getAlmacenOrigen().setIdAlm(guardarMovimiento.getAlmacenOrigen().getId());
        }
        if (result.getAlmacenDestino() != null && guardarMovimiento.getAlmacenDestino() != null) {
            result.getAlmacenDestino().setIdAlm(guardarMovimiento.getAlmacenDestino().getId());
        }
        return result;
    }

    @Override
    public byte[] generarTicketMovimientoPDF(Long movimientoId) {
        try {
            System.out.println("DEBUG: Iniciando generación de PDF para movimiento ID: " + movimientoId);

            // Verificar si el movimiento existe antes de procesar
            if (!movimientoRepository.existsById(movimientoId)) {
                System.err.println(
                        "ERROR: No se puede generar PDF - El movimiento con ID " + movimientoId + " no existe");
                throw new RuntimeException("No se puede generar el ticket PDF: El movimiento con ID " + movimientoId
                        + " no existe en la base de datos");
            }

            MovimientoDTO mov = obtenerMovimientoPorId(movimientoId);
            System.out.println("DEBUG: Movimiento obtenido exitosamente - Tipo: " + mov.getTipoMov());

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            System.out.println("DEBUG: ByteArrayOutputStream creado");

            // Tamaño ticket: ancho 80mm (227pt), alto ajustable
            float ancho = 227f; // 80mm en puntos
            float alto = 800f; // Altura ajustable
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            pdf.setDefaultPageSize(new PageSize(ancho, alto));
            Document document = new Document(pdf);
            System.out.println("DEBUG: Documento PDF creado");

            document.setMargins(15, 15, 15, 15); // Márgenes más pequeños

            // ===== ENCABEZADO =====
            // Título principal
            Paragraph titulo = new Paragraph("TICKET DE MOVIMIENTO")
                    .setBold()
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(titulo);

            // Línea separadora
            document.add(new Paragraph("═══════════════════════════════════════════════════════════")
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.CENTER));

            // Información del movimiento
            document.add(new Paragraph("INFORMACIÓN GENERAL").setBold().setFontSize(9));
            document.add(new Paragraph("ID: " + mov.getId()).setFontSize(8));
            document.add(new Paragraph("Fecha: " + mov.getFecha()).setFontSize(8));
            document.add(new Paragraph("Tipo: " + mov.getTipoMov().toUpperCase()).setBold().setFontSize(8));
            document.add(new Paragraph("Usuario: " + (mov.getUsuarioMov() != null ? mov.getUsuarioMov() : "N/A"))
                    .setFontSize(8));

            // Línea separadora
            document.add(new Paragraph("───────────────────────────────────────────────────────────")
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.CENTER));

            // Información de almacenes
            document.add(new Paragraph("ALMACENES").setBold().setFontSize(9));
            document.add(new Paragraph(
                    "Origen: " + (mov.getAlmacenOrigen() != null ? mov.getAlmacenOrigen().getNombre() : "-"))
                    .setFontSize(8));
            document.add(new Paragraph(
                    "Destino: " + (mov.getAlmacenDestino() != null ? mov.getAlmacenDestino().getNombre() : "-"))
                    .setFontSize(8));

            // Motivo si existe
            if (mov.getMotivo() != null && !mov.getMotivo().trim().isEmpty()) {
                document.add(new Paragraph("Motivo: " + mov.getMotivo()).setFontSize(8));
            }

            // Línea separadora
            document.add(new Paragraph("───────────────────────────────────────────────────────────")
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.CENTER));

            // ===== PRODUCTOS =====
            if (mov.getDetalles() != null && !mov.getDetalles().isEmpty()) {
                document.add(new Paragraph("PRODUCTOS").setBold().setFontSize(9));

                // Tabla mejorada
                float[] columnWidths = { 140F, 50F, 30F };
                Table table = new Table(columnWidths);

                // Encabezados de tabla
                Cell header1 = new Cell().add(new Paragraph("Producto").setBold().setFontSize(8));
                Cell header2 = new Cell().add(new Paragraph("Cant.").setBold().setFontSize(8));
                Cell header3 = new Cell().add(new Paragraph("ID").setBold().setFontSize(8));

                header1.setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY);
                header2.setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY);
                header3.setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY);

                table.addHeaderCell(header1);
                table.addHeaderCell(header2);
                table.addHeaderCell(header3);

                int contador = 1;
                for (DetalleMovimientoDTO det : mov.getDetalles()) {
                    if (det.getProducto() != null) {
                        System.out.println("DEBUG: Agregando fila - Producto: " + det.getProducto().getNombre() +
                                " - Cantidad: " + det.getCantidad());

                        // Nombre del producto (truncado si es muy largo)
                        String nombreProducto = det.getProducto().getNombre();
                        if (nombreProducto.length() > 20) {
                            nombreProducto = nombreProducto.substring(0, 17) + "...";
                        }

                        table.addCell(new Cell().add(new Paragraph(nombreProducto).setFontSize(7)));
                        table.addCell(new Cell().add(new Paragraph(det.getCantidad().toString()).setFontSize(7)));
                        table.addCell(new Cell().add(new Paragraph(String.valueOf(contador)).setFontSize(7)));
                        contador++;
                    } else {
                        System.out.println("DEBUG: Detalle sin producto asociado");
                    }
                }
                document.add(table);
                System.out.println("DEBUG: Tabla agregada al documento");
            } else {
                document.add(new Paragraph("PRODUCTOS").setBold().setFontSize(9));
                document.add(new Paragraph("No hay productos en este movimiento").setFontSize(8).setItalic());
            }

            // Línea separadora final
            document.add(new Paragraph("═══════════════════════════════════════════════════════════")
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.CENTER));

            // Pie de página
            document.add(new Paragraph("Ticket generado automáticamente")
                    .setFontSize(6)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic());
            document.add(new Paragraph("Sistema de Gestión de Inventarios")
                    .setFontSize(6)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic());

            document.close();
            System.out.println("DEBUG: Documento cerrado");

            byte[] result = baos.toByteArray();
            System.out.println("DEBUG: PDF generado exitosamente - Tamaño: " + result.length + " bytes");
            return result;
        } catch (Exception e) {
            System.err
                    .println("ERROR generando PDF del ticket para movimiento " + movimientoId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al generar el ticket PDF: " + e.getMessage());
        }
    }
}
