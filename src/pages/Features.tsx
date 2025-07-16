import React from 'react';
import { Link } from 'react-router-dom';
import { 
  QrCodeIcon,
  ChartBarIcon,
  PhotoIcon,
  PaintBrushIcon,
  DevicePhoneMobileIcon,
  GlobeAmericasIcon,
  ShieldCheckIcon,
  CogIcon,
  ArrowPathIcon,
  DocumentIcon,
  EyeIcon,
  SparklesIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const Features: React.FC = () => {
  const qrTypes = [
    { icon: '🌐', name: 'Sitio Web', description: 'Enlaces a páginas web' },
    { icon: '👤', name: 'Tarjeta de Contacto', description: 'Información personal o empresarial' },
    { icon: '📝', name: 'Texto', description: 'Mensajes de texto simples' },
    { icon: '📧', name: 'Email', description: 'Envío de correos predefinidos' },
    { icon: '💬', name: 'SMS', description: 'Mensajes de texto a teléfonos' },
    { icon: '📶', name: 'WiFi', description: 'Conexión automática a redes' },
    { icon: '📱', name: 'Redes Sociales', description: 'Enlaces a perfiles sociales' },
    { icon: '📍', name: 'Ubicación', description: 'Coordenadas GPS o direcciones' },
    { icon: '📅', name: 'Evento', description: 'Información para calendarios' },
    { icon: '🏢', name: 'Página de Negocio', description: 'Información empresarial completa' },
    { icon: '₿', name: 'Billetera Cripto', description: 'Direcciones de criptomonedas' },
    { icon: '🍽️', name: 'Menú', description: 'Menús de restaurantes' }
  ];

  const imageFormats = [
    { name: 'PNG', description: 'Ideal para web y redes sociales', quality: 'Alta calidad', transparency: 'Sí' },
    { name: 'JPG', description: 'Perfecto para impresión', quality: 'Alta calidad', transparency: 'No' },
    { name: 'SVG', description: 'Vector escalable infinitamente', quality: 'Vectorial', transparency: 'Sí' },
    { name: 'PDF', description: 'Listo para impresión profesional', quality: 'Vectorial', transparency: 'Sí' },
    { name: 'EPS', description: 'Para diseño gráfico profesional', quality: 'Vectorial', transparency: 'Sí' }
  ];

  const customizationOptions = [
    {
      icon: PaintBrushIcon,
      title: 'Colores Personalizados',
      description: 'Cambia los colores del código QR para que coincidan con tu marca',
      features: ['Color de primer plano', 'Color de fondo', 'Gradientes lineales', 'Verificación de contraste']
    },
    {
      icon: SparklesIcon,
      title: 'Formas y Estilos',
      description: 'Personaliza la apariencia de los módulos del código QR',
      features: ['Módulos cuadrados', 'Módulos redondeados', 'Módulos circulares', 'Esquinas personalizadas']
    },
    {
      icon: PhotoIcon,
      title: 'Logo Central',
      description: 'Añade tu logo en el centro del código QR',
      features: ['Subida de imagen', 'Redimensionado automático', 'Corrección de errores nivel H', 'Fondo transparente']
    },
    {
      icon: DocumentIcon,
      title: 'Marcos y Texto',
      description: 'Añade marcos decorativos con texto personalizado',
      features: ['Galería de marcos', 'Texto editable', 'Llamadas a la acción', 'Estilos predefinidos']
    }
  ];

  const analyticsFeatures = [
    { icon: ChartBarIcon, title: 'Escaneos Totales', description: 'Número total de veces que se ha escaneado tu código' },
    { icon: EyeIcon, title: 'Escaneos Únicos', description: 'Usuarios únicos que han escaneado tu código' },
    { icon: GlobeAmericasIcon, title: 'Ubicación Geográfica', description: 'Mapa interactivo mostrando dónde se escanea' },
    { icon: DevicePhoneMobileIcon, title: 'Dispositivos', description: 'Tipos de dispositivos utilizados para escanear' },
    { icon: CogIcon, title: 'Horarios de Actividad', description: 'Gráficos de cuándo se escanea más tu código' },
    { icon: ArrowPathIcon, title: 'Tiempo Real', description: 'Datos actualizados instantáneamente' }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Características</h2>
          <p className="mt-2 text-4xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Todo lo que necesitas para crear códigos QR profesionales
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Discover all the features that make Lady QR the most complete platform for businesses worldwide
          </p>
        </div>

        {/* QR Types Comparison */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              Códigos QR Estáticos vs Dinámicos
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Entiende las diferencias y elige el tipo correcto para tus necesidades
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Static QR */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <QrCodeIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <h4 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                  Códigos QR Estáticos
                </h4>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Los datos se codifican directamente en el patrón del código QR. Una vez creado, no se puede modificar.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Permanentes</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Funcionan para siempre, sin depender de servidores</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Rápidos</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Escaneo instantáneo sin redirecciones</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Ideales para</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">WiFi, texto, contactos, ubicaciones</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-700">
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  <strong>Limitación:</strong> No se pueden editar después de crear y no incluyen analíticas.
                </p>
              </div>
            </div>

            {/* Dynamic QR */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 border-2 border-primary-200 dark:border-primary-700">
              <div className="flex items-center space-x-3 mb-6">
                <ArrowPathIcon className="h-8 w-8 text-primary-600" />
                <h4 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                  Códigos QR Dinámicos
                </h4>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Redirigen a través de una URL corta que puedes cambiar en cualquier momento. Incluyen analíticas completas.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Editables</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Cambia el destino sin reimprimir el código</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Analíticas</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Rastrea escaneos, ubicaciones y dispositivos</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Ideales para</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Marketing, eventos, negocios, campañas</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-primary-100 dark:bg-primary-800/30 rounded-lg">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  <strong>Ventaja:</strong> Perfectos para campañas de marketing donde necesitas flexibilidad y datos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Types Grid */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              15+ Tipos de Códigos QR
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Crea códigos QR para cualquier propósito con nuestros tipos especializados
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {qrTypes.map((type, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{type.icon}</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{type.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Image Formats */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              Formatos de Descarga
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Descarga tus códigos QR en el formato perfecto para cada uso
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imageFormats.map((format, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-poppins font-bold text-gray-900 dark:text-white">
                    {format.name}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    format.quality === 'Vectorial' 
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {format.quality}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{format.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Transparencia:</span>
                    <span className="text-gray-900 dark:text-white">{format.transparency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Calidad:</span>
                    <span className="text-gray-900 dark:text-white">{format.quality}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-accent-50 dark:bg-accent-900/20 rounded-lg p-6 border border-accent-200 dark:border-accent-700">
            <h4 className="font-semibold text-accent-800 dark:text-accent-300 mb-2">
              💡 Recomendaciones de Uso
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-accent-700 dark:text-accent-400">
              <div>
                <strong>Para Web y Redes Sociales:</strong> PNG con fondo transparente
              </div>
              <div>
                <strong>Para Impresión:</strong> PDF o EPS en alta resolución
              </div>
              <div>
                <strong>Para Email:</strong> JPG o PNG optimizado
              </div>
              <div>
                <strong>Para Diseño Gráfico:</strong> SVG o EPS vectorial
              </div>
            </div>
          </div>
        </div>

        {/* Customization Options */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              Personalización Completa
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Haz que tus códigos QR reflejen perfectamente tu marca
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {customizationOptions.map((option, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <option.icon className="h-8 w-8 text-primary-600" />
                  <h4 className="text-xl font-poppins font-bold text-gray-900 dark:text-white">
                    {option.title}
                  </h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{option.description}</p>
                <ul className="space-y-2">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-success-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Features */}
        <div className="mt-16 sm:mt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-poppins font-bold tracking-tight text-gray-900 dark:text-white">
              Analíticas Avanzadas
            </h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Obtén insights valiosos sobre cómo interactúan con tus códigos QR
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsFeatures.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <feature.icon className="h-8 w-8 text-primary-600 mb-4" />
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-700">
            <p className="text-sm text-primary-700 dark:text-primary-300 text-center">
              <strong>Nota:</strong> Las analíticas están disponibles solo para códigos QR dinámicos en planes Profesional y Negocios.
            </p>
          </div>
        </div>

        {/* Security & Reliability */}
        <div className="mt-16 sm:mt-20">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
            <div className="text-center mb-8">
              <ShieldCheckIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                Seguridad y Confiabilidad
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Tu información y la de tus usuarios está protegida
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Encriptación SSL</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Todos los datos se transmiten de forma segura</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">☁️</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Respaldo en la Nube</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tus códigos están seguros en Firebase</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">99.9% Uptime</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disponibilidad garantizada para tus códigos</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 sm:mt-20 text-center">
          <h3 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white mb-4">
            ¿Listo para crear códigos QR profesionales?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Start free and discover all the features of Lady QR
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Crear QR Gratis
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Ver Precios
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;