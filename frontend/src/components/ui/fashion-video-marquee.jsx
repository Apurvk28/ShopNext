import { Card } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";

const BASE_URL = "https://images.shadcnspace.com/assets/marquee";

const videos = [
  { title: "Video 1", video: `${BASE_URL}/marquee-1.mp4` },
  { title: "Video 2", video: `${BASE_URL}/marquee-2.mp4` },
  { title: "Video 3", video: `${BASE_URL}/marquee-3.mp4` },
  { title: "Video 4", video: `${BASE_URL}/marquee-4.mp4` },
  { title: "Video 5", video: `${BASE_URL}/marquee-5.mp4` },
];

const VideoCard = ({ title, video }) => {
  return (
    <Card className="h-[340px] w-56 md:h-[470px] md:w-80 shrink-0 overflow-hidden rounded-2xl border border-[#e5e7eb] p-0 shadow-none">
      <video
        aria-label={title}
        className="h-full w-full object-cover"
        src={video}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    </Card>
  );
};

const VideoMarqueeDemo = () => {
  return (
    <div className="relative mt-12 flex w-full items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:15s] [--gap:1.5rem]">
        {videos.map((item) => (
          <VideoCard key={item.video} {...item} />
        ))}
      </Marquee>
    </div>
  );
};

export default VideoMarqueeDemo;
