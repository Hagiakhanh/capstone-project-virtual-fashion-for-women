import { ArrowRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import Vay from '../../assets/home/Vay.png'
import Dam from '../../assets/home/Dam.png'
import Ao from '../../assets/home/Ao.png'
import Quan from '../../assets/home/Quan.jpg'
import Point from '../../assets/home/Dot.png'
import Link from 'next/link';

function HomeIntroSection() {
   return (
      <div className="px-4 sm:px-6 lg:px-0">
         <div className="max-w-full sm:max-w-[90%] lg:max-w-[80%] mx-auto pt-10 sm:pt-20 lg:pt-35 relative">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl w-full sm:w-[90%] lg:w-[80%] mx-auto font-semibold text-center leading-tight sm:leading-relaxed from-[#FFAF37] to-[#996921] bg-gradient-to-r bg-clip-text text-transparent px-4 sm:px-0">
               Gợi ý trang phục theo phong cách <br className="hidden sm:block"/>với trợ lý ảo
            </h1>
            
            <div className="flex justify-center mt-6 sm:mt-8">
               <Link 
                  href={"/recommendation"} 
                  style={{ 
                     fontSize: '1rem',
                     fontWeight: 'bold', 
                     backgroundImage: 'linear-gradient(to right, #FFAF37, #996921)', 
                     border: 'none' 
                  }} 
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-full !text-white shadow-lg hover:shadow-xl transition-shadow sm:text-xl"
               >
                  <div className="flex items-center gap-2 sm:gap-3">
                     <h1>Gợi ý ngay</h1>
                     <ArrowRightOutlined />
                  </div>
               </Link>
            </div>
            
            <div className='absolute top-20 sm:top-40 lg:top-55 -right-4 sm:-right-10 w-16 sm:w-20 lg:w-auto opacity-50 sm:opacity-100'>
               <img src={Point.src} alt="Point" className="w-full" />
            </div>

            {/* Grid for mobile, flex for desktop */}
            <div className='grid grid-cols-2 sm:grid-cols-2 lg:flex lg:justify-between mt-8 sm:mt-10 gap-3 sm:gap-4 lg:gap-10'>
               {/* Váy */}
               <div className='h-[180px] sm:h-[280px] lg:h-[400px] lg:flex-1 relative shadow-lg lg:shadow-xl rounded-xl lg:rounded-2xl overflow-hidden'>
                  <img src={Vay.src} alt="Váy" className='w-full h-full object-cover' />
                  <h1 className='absolute bottom-2 sm:bottom-4 lg:bottom-6 inline-block bg-white left-2 right-2 sm:left-3 sm:right-3 lg:left-4 lg:right-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-center text-sm sm:text-lg lg:text-2xl font-semibold py-1 sm:py-1.5 lg:py-2 shadow-lg lg:shadow-xl'>
                     Váy
                  </h1>
               </div>
               
               {/* Đầm */}
               <div className='h-[180px] sm:h-[280px] lg:h-[400px] lg:flex-1 lg:mt-15 relative shadow-lg lg:shadow-xl rounded-xl lg:rounded-2xl overflow-hidden'>
                  <img src={Dam.src} alt="Đầm" className='w-full h-full object-cover' />
                  <h1 className='absolute bottom-2 sm:bottom-4 lg:bottom-6 inline-block bg-white left-2 right-2 sm:left-3 sm:right-3 lg:left-4 lg:right-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-center text-sm sm:text-lg lg:text-2xl font-semibold py-1 sm:py-1.5 lg:py-2 shadow-lg lg:shadow-xl'>
                     Đầm
                  </h1>
               </div>
               
               {/* Áo */}
               <div className='h-[180px] sm:h-[280px] lg:h-[400px] lg:flex-1 relative shadow-lg lg:shadow-xl rounded-xl lg:rounded-2xl overflow-hidden'>
                  <img src={Ao.src} alt="Áo" className='w-full h-full object-cover' />
                  <h1 className='absolute bottom-2 sm:bottom-4 lg:bottom-6 inline-block bg-white left-2 right-2 sm:left-3 sm:right-3 lg:left-4 lg:right-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-center text-sm sm:text-lg lg:text-2xl font-semibold py-1 sm:py-1.5 lg:py-2 shadow-lg lg:shadow-xl'>
                     Áo
                  </h1>
               </div>
               
               {/* Quần */}
               <div className='h-[180px] sm:h-[280px] lg:h-[400px] lg:flex-1 lg:mt-15 relative shadow-lg lg:shadow-xl rounded-xl lg:rounded-2xl overflow-hidden'>
                  <img src={Quan.src} alt="Quần" className='w-full h-full object-cover' />
                  <h1 className='absolute bottom-2 sm:bottom-4 lg:bottom-6 inline-block bg-white left-2 right-2 sm:left-3 sm:right-3 lg:left-4 lg:right-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-center text-sm sm:text-lg lg:text-2xl font-semibold py-1 sm:py-1.5 lg:py-2 shadow-lg lg:shadow-xl'>
                     Quần
                  </h1>
               </div>
            </div>
         </div>
      </div>
   )
}

export default HomeIntroSection;