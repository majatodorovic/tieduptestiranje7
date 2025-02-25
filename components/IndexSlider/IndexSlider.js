"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Aos from "aos";
import { convertHttpToHttps } from "@/helpers/convertHttpToHttps";

function extractYoutubeId(url) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regex);
  return match ? match[1] : null;
}

const RenderBanner = ({ banner }) => {
  switch (banner.type) {
    case "image": {
      return (
        <Image
          src={banner?.image}
          alt={banner?.title}
          width={0}
          height={0}
          sizes={`100vw`}
          className="w-full h-[505px] object-cover"
          priority
        />
      );
    }
    case "video_link": {
      const videoProvider = banner.video_provider;
      const videoUrl = banner.video_url;

      const src =
        videoProvider === "youtube"
          ? `https://www.youtube.com/embed/${extractYoutubeId(
            videoUrl
          )}?autoplay=1&mute=1&loop=1&playsinline=1&controls=0&playlist=${extractYoutubeId(
            videoUrl
          )}`
          : `${videoUrl}?autoplay=1&muted=1&loop=1&background=1&playsinline=1}`;

      return (
        <iframe
          className="w-full h-full object-cover aspect-[960/1550] md:aspect-[1920/800] pointer-events-none"
          width={banner.width}
          height={banner.height}
          src={src}
          style={{ border: "none" }}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }
    case "video": {
      return (
        <>
          <video
            key={banner?.file}
            width={banner?.file_data?.banner_position?.width}
            height={banner?.file_data?.banner_position?.height}
            className="bg-fixed w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
          >
            <source src={convertHttpToHttps(banner?.file)} type="video/mp4" />
            <source
              src={convertHttpToHttps(banner?.file.replace(".mp4", ".webm"))}
              type="video/webm"
            />
            Your browser does not support the video tag.
          </video>
        </>
      );
    }
    default:
      break;
  }
};

const IndexSlider = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState({
    index: 0,
    banner: banners[0]?.image,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(0);
  const sliderRef = useRef();
  const touchStartX = useRef(0);

  const intervalRef = useRef(null);

  useEffect(() => {
    let banner = banners;

    const nextSlide = () => {
      setCurrentSlide((prevState) => {
        const nextIndex = (prevState.index + 1) % banner?.length;
        return {
          index: nextIndex,
          banner: banner?.[nextIndex]?.image,
        };
      });
    };

    const resetInterval = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(nextSlide, 2000);
    };

    intervalRef.current = setInterval(nextSlide, 2000);
    const handleInteraction = () => {
      resetInterval();
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [banners]);

  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prevState) => {
        const nextIndex = (prevState.index + 1) % banners.length;
        return {
          index: nextIndex,
          banner: banners[nextIndex]?.image,
        };
      });
    }, 5000);
  };


  const handleSlideChange = (index) => {
    setCurrentSlide({
      index: index,
      banner: banners?.[index]?.image,
    });
    clearInterval(intervalRef.current); // Pauziramo interval
    setTimeout(() => {
      resetInterval(); // Ponovo pokrećemo automatsko menjanje slajda nakon 5 sekundi
    }, 5000);
  };

  useEffect(() => {
    Aos.init();
  });

  const handleTouchStart = (event) => {
    setIsDragging(true);
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchMove = (event) => {
    if (isDragging) {
      const sliderRect = sliderRef.current.getBoundingClientRect();
      const slideWidth = sliderRect.width / banners.length;
      const touchX = event.touches[0].clientX;
      const diffX = touchStartX.current - touchX;
      if (Math.abs(diffX) > slideWidth / 3) {
        const newIndex = diffX > 0 ? currentSlide.index + 1 : currentSlide.index - 1;
        if (newIndex >= 0 && newIndex < banners.length) {
          setCurrentSlide({
            index: newIndex,
            banner: banners[newIndex]?.image,
          });
          clearInterval(intervalRef.current); // Pauziramo automatski slajder
          setTimeout(() => {
            resetInterval(); // Ponovo pokrećemo nakon 5 sekundi
          }, 2000);
        }
        touchStartX.current = touchX;

      }
    }
  };

  const handleMouseDown = (event) => {
    setIsDragging(true);
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const mouseX = event.clientX - sliderRect.left;
    const slideWidth = sliderRect.width / banners.length;
    setDraggingIndex(Math.floor(mouseX / slideWidth));
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setCurrentSlide({
        index: draggingIndex,
        banner: banners[draggingIndex]?.image,
      });
      setIsDragging(false);
      resetInterval(); // Resetuj interval nakon prevlačenja
    }
  };

  useEffect(() => {
    const sliderElement = sliderRef.current;
    sliderElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    sliderElement.addEventListener("touchmove", handleTouchMove, { passive: true });
    sliderElement.addEventListener("mousedown", handleMouseDown, { passive: true });
    sliderElement.addEventListener("mouseup", handleMouseUp, { passive: true });

    return () => {
      sliderElement.removeEventListener("touchstart", handleTouchStart);
      sliderElement.removeEventListener("touchmove", handleTouchMove);
      sliderElement.removeEventListener("mousedown", handleMouseDown);
      sliderElement.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, currentSlide.index, banners]);

  return (
    <div className="w-screen block" ref={sliderRef}>
      <div className="relative h-full overflow-hidden">
        <div className="items-center justify-between h-full w-full">
          {(banners ?? [])?.map((banner, index) => {
            const isActive = currentSlide?.index === index;
            return (
              <div
                key={index}
                className={
                  isActive
                    ? "relative w-full overflow-hidden h-full opacity-100 duration-[1000ms] transition-all ease-linear"
                    : "absolute w-full h-full overflow-hidden opacity-0 duration-[1000ms] transition-all ease-linear"
                }
              >
                <div className="relative sm:h-full">
                  <RenderBanner banner={banner} />
                  <Link
                    href={banner?.url ?? "/stranica-u-izradi"}
                    target={banner?.target ?? "_self"}
                    className="absolute z-[49] top-0 left-0 w-full h-full bg-black transition-all duration-500 bg-opacity-20"
                  >
                    <div className="absolute flex flex-col items-center md:items-start justify-center md:justify-start max-sm:gap-[20px] gap-[10px] max-sm:top-[50%] top-[48%] text-center max-md:mx-7 md:left-[8%] transform -translate-y-1/2">
                      {banner?.title && (
                        <h1 className="text-white max-sm:text-base text-xl font-normal">
                          {banner?.title}
                        </h1>
                      )}
                      {banner?.subtitle && (
                        <h2 className="text-white max-sm:text-xl text-[42px] font-semibold sm:tracking-wider max-sm:tracking-normal max-sm:mx-auto">
                          {banner?.subtitle}
                        </h2>
                      )}
                      {banner?.text && (
                        <p className="text-white md:text-left sm:max-w-[60%] max-sm:text-[0.925rem] text-base font-normal">
                          {banner?.text}
                        </p>
                      )}
                      {banner?.button && (
                        <button className="bg-transparent hover:bg-white hover:text-black transition-all duration-300 text-white text-sm font-bold uppercase py-4 px-12 max-sm:px-2 max-sm:py-2 max-sm:flex max-sm:items-center max-sm:justify-center border border-white max-sm:w-[250px] mt-2">
                          {banner?.button}
                        </button>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative">
        <div className="absolute max-sm:-top-[1rem] md:-top-[2rem] xl:-top-[2rem] 2xl:-top-20 w-full flex items-center justify-center z-[50]">
          {banners?.map((banner, index) => (
            <div
              key={index}
              className={`${currentSlide?.index === index ? "bganimate" : "bg-white"
                } w-32 h-[3.5px] mx-1 cursor-pointer`}
              onClick={() => handleSlideChange(index)}
            ></div>
          ))}

          {banners?.map((banner, index) => (
            <div
              key={index}
              className="absolute flex gap-10 items-center bottom-6"
            >
              <i
                className="cursor-pointer fas fa-chevron-left text-white text-sm"
                onClick={
                  currentSlide?.index === 0
                    ? () => handleSlideChange(banners.length - 1)
                    : () => handleSlideChange(currentSlide?.index - 1)
                }
              ></i>
              <div>
                <p className="text-white">{`${currentSlide?.index + 1} / ${banners?.length
                  }`}</p>
              </div>
              <i
                className="fas cursor-pointer fa-chevron-right text-white text-sm"
                onClick={
                  currentSlide?.index === banners.length - 1
                    ? () => handleSlideChange(0)
                    : () => handleSlideChange(currentSlide?.index + 1)
                }
              ></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndexSlider;