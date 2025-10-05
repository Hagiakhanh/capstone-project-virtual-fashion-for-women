import { FacebookOutlined, TikTokOutlined, InstagramOutlined } from '@ant-design/icons';

import logo from '../../assets/home/Logo.png';

function FooterComponent() {
   return (
      <div className='border-t-2 border-gray-200 mt-10 mb-5 bg-[#FAE3B6]'>
         <div className="w-[80%] mx-auto py-10 text-center">
            <div className="flex">
               <div className='flex-1'>
                  <img src={logo.src} alt="" className='w-50 object-cover' />
               </div>
               <div className="flex flex-2 flex-col text-left">
                  <h1 className="text-4xl font-bold pt-8">
                     VFW
                  </h1>
                  <div className="mt-5 text-lg border-t-2 border-gray-400 pt-5">
                     <p>7 Đ. D1, Long Thạnh Mỹ, Thủ Đức, Hồ Chí Minh</p>
                     <p className="font-bold">Email: <span className="font-normal">info@vfw.com</span></p>
                     <p className="font-bold">Liên hệ: <span className="font-normal">0868728859</span></p>
                  </div>
                  <div className="text-lg">
                     <div className='flex gap-3 items-center text-3xl pt-3'>
                        <FacebookOutlined />
                        <TikTokOutlined />
                        <InstagramOutlined />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

export default FooterComponent;