import { jsPDF } from 'jspdf';
import { InventoryItem, isMobileRoute, getDisponibilidad } from '../types';

export function generateMediaKitPdf(selectedItems: InventoryItem[]): void {
  if (selectedItems.length === 0) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = 297; // A4 height
  const pageWidth = 210; // A4 width
  let yPosition = 15;

  const checkPageBreak = (neededHeight: number) => {
    if (yPosition + neededHeight > pageHeight - 15) {
      doc.addPage();
      yPosition = 15;
      drawFooter();
    }
  };

  const drawFooter = () => {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      'Grupo Comunicarte S.A. | contacto@grupocomunicarte.com.ar | www.grupocomunicarte.com.ar',
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
    const pageNum = doc.getNumberOfPages();
    doc.text(`Página ${pageNum}`, pageWidth - 15, pageHeight - 8, { align: 'right' });
  };

  // --- Front Page or Header Section ---
  // Dark slate top banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('GRUPO COMUNICARTE S.A.', pageWidth / 2, 18, { align: 'center' });

  // Subtitle
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('PROPUESTA DE MEDIOS OOH - MEDIA KIT EXCLUSIVO', pageWidth / 2, 26, { align: 'center' });

  // Divider
  doc.setDrawColor(234, 179, 8); // amber-500
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 30, 31, pageWidth / 2 + 30, 31);

  // Date and stats in banner
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const todayStr = new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Fecha: ${todayStr}   |   Soportes Seleccionados: ${selectedItems.length}`, pageWidth / 2, 38, {
    align: 'center',
  });

  yPosition = 55;

  // Introduction text
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85); // slate-700
  const introText =
    'Presentamos nuestra propuesta de cobertura de vía pública (Out-of-Home). A continuación se detallan las ubicaciones, formatos, características técnicas y alcance estimado para cada soporte seleccionado de nuestro inventario.';
  
  const introLines = doc.splitTextToSize(introText, pageWidth - 30);
  doc.text(introLines, 15, yPosition);
  yPosition += (introLines.length * 5) + 10;

  // --- Support Items ---
  selectedItems.forEach((item, index) => {
    const itemHeight = 62; // Height needed for one item card
    checkPageBreak(itemHeight);

    // Item card background box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPosition, pageWidth - 30, itemHeight - 5, 3, 3, 'FD');

    // Accent left bar based on type
    const isLed = item.tipo_soporte === 'led';
    const isMobile = item.tipo_soporte === 'led_movil';
    if (isLed) {
      doc.setFillColor(79, 70, 229); // indigo-600
    } else if (isMobile) {
      doc.setFillColor(234, 179, 8); // amber-500
    } else {
      doc.setFillColor(15, 23, 42); // slate-900
    }
    doc.rect(15, yPosition, 2, itemHeight - 5, 'F');

    // Title / ID block
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    const itemTitle = `${index + 1}. ${item.name}`;
    doc.text(itemTitle, 22, yPosition + 6);

    // Badge showing type
    const tipoLabel = isMobile ? 'LED MÓVIL' : isLed ? 'PANTALLA LED' : 'TRADICIONAL';
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(tipoLabel, pageWidth - 20, yPosition + 6, { align: 'right' });

    // Inner horizontal divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(22, yPosition + 10, pageWidth - 22, yPosition + 10);

    // Details Grid Layout
    let currentY = yPosition + 15;

    // Col 1: Location & Coverage
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('Ubicación & Cobertura', 22, currentY);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42); // slate-900
    const address = 'address' in item ? item.address : 'Recorrido dinámico';
    const plazaLabel = item.ciudad === 'mendoza' ? 'Gran Mendoza' : 'Buenos Aires';
    doc.text(`📍 Ciudad: ${plazaLabel}`, 22, currentY + 4.5);
    
    // Split address if it's too long
    const addressLines = doc.splitTextToSize(`📍 Dirección: ${address}`, 65);
    doc.text(addressLines, 22, currentY + 9);

    // Col 2: Technical Formats
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('Especificaciones Técnicas', 95, currentY);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42); // slate-900
    const measures = item.technical?.measures || item.characteristics || 'A convenir';
    doc.text(`📐 Medidas: ${measures}`, 95, currentY + 4.5);

    const extraSpec = isMobile && isMobileRoute(item)
      ? `🕒 Horario: ${item.schedule || 'Comercial'}` 
      : isLed 
        ? `⚙️ Resolución: ${item.technical?.resolution || 'HD'}` 
        : `⚙️ Caras: ${item.technical?.caras || '1 Cara'}`;
    doc.text(extraSpec, 95, currentY + 9);

    const description = item.description || 'Soporte publicitario premium.';
    const descLines = doc.splitTextToSize(`📝 Nota: ${description}`, 65);
    doc.text(descLines, 95, currentY + 13.5);

    // Col 3: Impact & Availability
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('Impactos & Disponibilidad', 162, currentY);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42); // slate-900
    const views = item.technical?.monthly_impacts || 'Excelente';
    doc.text(`📊 Alcance: ${views} imp/mes`, 162, currentY + 4.5);

    const disp = getDisponibilidad(item);
    const dispText = disp === 'disponible' ? '✅ Disponible' : '⚠️ Reservado';
    doc.text(`📅 Estado: ${dispText}`, 162, currentY + 9);

    yPosition += itemHeight;
  });

  // Draw footer on last page
  drawFooter();

  // Save Document
  const docName = `Media_Kit_Comunicarte_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(docName);
}
