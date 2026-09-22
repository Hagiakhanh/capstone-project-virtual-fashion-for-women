export default function SaleCampaignSkeleton() {
    return (
      <div className="mb-8 animate-pulse">
        <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl shadow-lg bg-gray-200">
          
          {/* Overlay giống layout thật */}
          <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
            
            {/* Title skeleton */}
            <div className="h-10 w-3/4 bg-gray-300 rounded mb-4"></div>
  
            {/* Time skeleton */}
            <div className="h-5 w-1/2 bg-gray-300 rounded mb-3"></div>
  
            {/* Countdown skeleton */}
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-14 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  