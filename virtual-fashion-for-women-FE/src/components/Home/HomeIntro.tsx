import { ArrowRightOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import Vay from '../../assets/home/Vay.png'
import Dam from '../../assets/home/Dam.png'
import Ao from '../../assets/home/Ao.png'
import Quan from '../../assets/home/Quan.jpg'
import Point from '../../assets/home/Dot.png'

function HomeIntroSection() {
   return (
      <div className="bg-gradient-to-b from-[#FAE3B6] via-[#FAE3B6] via-60% to-white">
         <div className="max-w-[80%] mx-auto pt-35 relative">
            <h1 className="text-7xl w-[80%] mx-auto font-semibold text-center leading-relaxed from-[#FFAF37] to-[#996921] bg-gradient-to-r bg-clip-text text-transparent">
               Thiết kế bộ đồ theo đặc điểm và yêu cầu của bạn
            </h1>
            <div className="flex justify-center">
               <Button style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundImage: 'linear-gradient(to right, #FFAF37, #996921)', border: 'none' }}
                  className="mt-5 !py-6 !text-white" shape="round">
                  <div className="flex items-center gap-3">
                     <h1>Thiết kế ngay</h1>
                     <ArrowRightOutlined />
                  </div>
               </Button>
            </div>
            <div className='absolute top-55 -right-10'>
               <img src={Point.src} alt="Point" />
            </div>

            <div className='flex justify-between mt-10 gap-10'>
               <div className='flex-1 h-[400px] relative shadow-xl round'>
                  <img src={Vay.src} alt="" className='rounded-2xl h-full object-cover' />
                  <h1 className='absolute bottom-6 inline-block bg-white left-0 right-0 mx-4 rounded-2xl text-center text-2xl font-semibold py-2 shadow-xl'>
                     Váy
                  </h1>
               </div>
               <div className='flex-1 mt-15 h-[400px] relative  rounded-2xl'>
                  <img src={Dam.src} alt="" className='rounded-2xl h-full object-cover' />
                  <h1 className='absolute bottom-6 inline-block bg-white left-0 right-0 mx-4 rounded-2xl text-center text-2xl font-semibold py-2 shadow-xl'>
                     Đầm
                  </h1>
               </div>
               <div className='flex-1 h-[400px] relative rounded-2xl'>
                  <img src={Ao.src} alt="" className='rounded-2xl h-full object-cover' />
                  <h1 className='absolute bottom-6 inline-block bg-white left-0 right-0 mx-4 rounded-2xl text-center text-2xl font-semibold py-2 shadow-xl'>
                     Áo
                  </h1>
               </div>
               <div className='flex-1 mt-15 h-[400px] relative shadow-xl rounded-2xl'>
                  <img src={Quan.src} alt="" className='rounded-2xl h-full object-cover' />
                  <h1 className='absolute bottom-6 inline-block bg-white left-0 right-0 mx-4 rounded-2xl text-center text-2xl font-semibold py-2 shadow-xl'>
                     Quần
                  </h1>
               </div>
            </div>
         </div>
      </div>
   )
}

export default HomeIntroSection;