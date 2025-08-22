import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Compress from '../pages/Compress.vue';
import Merge from '../pages/MergePdf.vue';
import Convert from '../pages/ImageConverter.vue';
import Resize from '../pages/ImageResizer.vue';
import PdfEditor from '../pages/PdfEditor.vue';
import PdfGenerator from '../pages/PdfGenerator.vue';
import DocumentToImageConverter from '../pages/DocumentToImageConverter.vue';
import PdfDocumentConverter from '../pages/PdfDocumentConverter.vue';
import ImagesToPdf from '../pages/ImagesToPdf.vue';
import DocumentConverter from '../pages/DocumentConverter.vue';
import AddPdfPassword from '../pages/RemovePdfPassword.vue';
import Extras from '../pages/Extras.vue';
import QrCodeGenerator from '../pages/QrCodeGenerator.vue';
import IaTools from '../pages/IaTools.vue';
import TermosDeUso from '../pages/TermosDeUso.vue';
import PoliticaPrivacidade from '../pages/PoliticaPrivacidade.vue';
import NotFound from '../pages/404.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/compress', component: Compress },
  { path: '/merge', component: Merge },
  { path: '/convert', component: Convert },
  { path: '/resize', component: Resize },
  { path: '/pdf-editor', component: PdfEditor },
  { path: '/pdf-generator', component: PdfGenerator },
  { path: '/pdf-converter', component: DocumentToImageConverter },
  { path: '/pdf-document-converter', component: PdfDocumentConverter },
  { path: '/images-to-pdf', component: ImagesToPdf },
  { path: '/document-converter', component: DocumentConverter },
  { path: '/add-pdf-password', component: AddPdfPassword },
  { path: '/extras', component: Extras },
  { path: '/qr-code', component: QrCodeGenerator },
  { path: '/ia-tools', component: IaTools },
  { path: '/termos', component: TermosDeUso },
  { path: '/privacidade', component: PoliticaPrivacidade },
  // Catch-all route for 404 errors
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;