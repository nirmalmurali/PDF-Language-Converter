import { jsPDF } from 'jspdf';

export function createSamplePdfFile(): File {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.text('Global AI Technology Report', 20, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);

  doc.text('1. Executive Summary', 20, 40);
  doc.setFontSize(10);
  const text1 =
    'The PDF language converter translates text content accurately across 25+ global languages while preserving layout structures and headings. Artificial intelligence tools enable seamless document localization across global teams.';
  const split1 = doc.splitTextToSize(text1, 170);
  doc.text(split1, 20, 48);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Key Features and System Architecture', 20, 75);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const text2 =
    'Our Next.js application processes PDF files directly in the browser environment. Users can select source and target languages, view live translation progress, and download the freshly generated translated PDF file.';
  const split2 = doc.splitTextToSize(text2, 170);
  doc.text(split2, 20, 83);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. Conclusion and Recommendations', 20, 110);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const text3 =
    'Document conversion ensures faster international communication, higher accessibility, and frictionless workflow automation across diverse enterprise departments.';
  const split3 = doc.splitTextToSize(text3, 170);
  doc.text(split3, 20, 118);

  const blob = doc.output('blob');
  return new File([blob], 'Sample_AI_Technology_Report.pdf', {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
}

export function createMalayalamSamplePdfFile(): File {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229);
  doc.text('Malayalam Document Sample (മലയാളം രേഖ)', 20, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);

  doc.text('1. ആമുഖം (Introduction)', 20, 40);
  doc.setFontSize(10);
  const text1 =
    'ഈ പി.ഡി.എഫ് ഭാഷാ പരിവർത്തന സംവിധാനം മലയാളം രേഖകൾ ഏത് ആഗോള ഭാഷയിലേക്കും എളുപ്പത്തിൽ വിവർത്തനം ചെയ്യാൻ സഹായിക്കുന്നു. സാങ്കേതിക വിവരങ്ങളും പേജ് ഘടനയും കൃത്യമായി സംരക്ഷിക്കപ്പെടുന്നു.';
  const split1 = doc.splitTextToSize(text1, 170);
  doc.text(split1, 20, 48);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. പ്രധാന സവിശേഷതകൾ (Key Features)', 20, 75);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const text2 =
    'ഉപയോക്താക്കൾക്ക് മലയാളത്തിലുള്ള പി.ഡി.എഫ് ഫയലുകൾ അപ്‌ലോഡ് ചെയ്യാനും ഇംഗ്ലീഷ്, സ്‌പാനിഷ്, ഫ്രഞ്ച്, ജർമ്മൻ, ഹിന്ദി തുടങ്ങിയ മറ്റ് ഭാഷകളിലേക്ക് വിവർത്തനം ചെയ്യാനും സാധിക്കും.';
  const split2 = doc.splitTextToSize(text2, 170);
  doc.text(split2, 20, 83);

  const blob = doc.output('blob');
  return new File([blob], 'Malayalam_Sample_Document.pdf', {
    type: 'application/pdf',
    lastModified: Date.now(),
  });
}
