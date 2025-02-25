"use client";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "swiper/css/pagination";
import "swiper/css/zoom";

import { FreeMode, Navigation, Pagination, Thumbs, Zoom } from "swiper";
import Image from "next/image";
import classes from "./styles.module.css";
import { convertHttpToHttps } from "@/helpers/convertHttpToHttps";

const ProductGallery = ({
  productGallery,
  color,
  proizvod,
  loading,
  product,
  setLoading,
  stickers,
}) => {
  function ImageMagnifier({
    src,
    width,
    alt,
    height,
    magnifierHeight = 300,
    magnifierWidth = 300,
    zoomLevel = 2.5,
    onClick = () => {},
  }) {
    const [[x, y], setXY] = useState([0, 0]);

    const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

    const [showMagnifier, setShowMagnifier] = useState(false);

    return (
      <div
        style={{
          position: "relative",
          zIndex: 100,
        }}
        className="!w-full"
        onClick={onClick}
      >
        <Image
          src={src}
          sizes={"100vw"}
          width={width ?? 0}
          height={height ?? 0}
          priority={true}
          className="!w-full !h-auto"
          onMouseEnter={(e) => {
            const elem = e.currentTarget;
            const { width, height } = elem.getBoundingClientRect();
            setSize([width, height]);
            setShowMagnifier(true);
          }}
          onMouseMove={(e) => {
            const elem = e.currentTarget;
            const { top, left } = elem.getBoundingClientRect();
            const x = e.pageX - left - window.pageXOffset;
            const y = e.pageY - top - window.pageYOffset;
            setXY([x, y]);
          }}
          onMouseLeave={() => {
            setShowMagnifier(false);
          }}
          alt={alt || ''}
        />

        <div
          style={{
            display: showMagnifier ? "" : "none",
            position: "absolute",
            pointerEvents: "none",
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            top: `${y - magnifierHeight / 2}px`,
            left: `${x - magnifierWidth / 2}px`,
            opacity: "1",
            border: "1px solid lightgray",
            borderRadius: "50%",
            backgroundColor: "white",
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${imgWidth * zoomLevel}px ${
              imgHeight * zoomLevel
            }px`,
            backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
            backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
          }}
        ></div>
      </div>
    );
  }

  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  const productImage = (productGallery ?? [])?.map((item, index) => {
    return (
      <SwiperSlide key={index} className="w-full !h-auto">
        <ImageMagnifier
          src={convertHttpToHttps(item?.image_data?.url)}
          alt={item?.image_data?.descriptions?.alt || ''}
          width={item?.image_data?.file_data?.width}
          height={item?.image_data?.file_data?.height}
          onClick={() => {
            setModalImage(item?.image_data?.url);
          }}
        />
      </SwiperSlide>
    );
  });

  const thumbImage = (productGallery ?? [])?.map((item, index) => {
    return (
      <SwiperSlide key={index}>
        <Image
          src={convertHttpToHttps(item?.image_data?.url)}
          alt={item?.image_data?.descriptions?.alt || ''}
          width={item?.image_data?.file_data?.width ?? 0}
          height={item?.image_data?.file_data?.height ?? 0}
          sizes={`100vw`}
          priority={true}
          className="cursor-pointer max-md:hidden"
        />
      </SwiperSlide>
    );
  });
  const [newImage, setNewImage] = useState(0);
  const [swiper, setSwiper] = useState(null);
  useEffect(() => {
    if (color) {
      if(proizvod) {
        const newImage = productGallery?.findIndex((item) =>
          item?.variant_key?.includes(proizvod) && item?.variant_key?.includes(color)
        );
        setNewImage(newImage);
        swiper?.slideTo(newImage);
      } else {
        const newImage = productGallery?.findIndex((item) =>
          item?.variant_key?.includes(color)
        );
        setNewImage(newImage);
        swiper?.slideTo(newImage);
      }

    }
  }, [color]);
  useEffect(() => {
    if (proizvod) {
      if(color) {
        const newImage = productGallery?.findIndex((item) =>
          item?.variant_key?.includes(proizvod) && item?.variant_key?.includes(color)
        );
        setNewImage(newImage);
        swiper?.slideTo(newImage);
      } else {
        const newImage = productGallery?.findIndex((item) =>
          item?.variant_key?.includes(proizvod)
        );
        setNewImage(newImage);
        swiper?.slideTo(newImage);
      }
    }
  }, [proizvod]);

  //Add logic for velicina when needed

  const renderDiscountPercentage = ({
    price: {
      discount: { campaigns },
    },
  }) => {
    let discounts = campaigns?.map(({ calc: { original, price } }) => {
      let price_num = Number(price);
      let original_num = Number(original);

      let discount = Math.round(
        ((original_num - price_num) / original_num) * 100
      );

      return (
        <p
          className={`bg-[#215352] px-[0.85rem] py-1 rounded-lg font-bold`}
        >{`- ${discount}%`}</p>
      );
    });

    return (
      <div
        className={`absolute right-2 top-2 z-[5] text-white text-[13px] flex flex-col gap-2`}
      >
        {discounts}
      </div>
    );
  };

  const renderStickers = ({ stickers }) => {
    let stickers_tmp = stickers?.map(({ name }, i) => {
      return (
        <p
          className={`bg-[#E7DCD1] text-black px-[0.85rem] py-1 rounded-lg font-bold`}
        >
          {name}
        </p>
      );
    });

    return (
      <div
        className={`absolute left-2 top-2 z-[5] text-white text-[13px] flex flex-col gap-2`}
      >
        {stickers_tmp}
      </div>
    );
  };

  return (
    <div className="col-span-2 max-lg:col-span-4 md:flex md:flex-row-reverse gap-5">
      <Swiper
        autoHeight
        spaceBetween={10}
        thumbs={{
          swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
        }}
        pagination={true}
        modules={[FreeMode, Thumbs, Pagination, Navigation]}
        initialSlide={color || proizvod ? newImage : 0}
        navigation={{
          enabled: true,
          hiddenClass: "swiper-mobile-hidden",
        }}
        loop={true}
        onSwiper={(swiper) => setSwiper(swiper)}
        breakpoints={{
          0: {
            direction: "vertical",
            slidesPerView: 1,
            pagination: {
              el: ".swiper-pagination",
              clickable: true,
              enabled: true,
              bulletClass: "swiper-pagination-bullet",
              bulletActiveClass: "swiper-pagination-bullet-active",
            },
            navigation: {
              el: ".swiper-nav-button",
              clickable: false,
              enabled: false,
              bulletClass: "swiper-pagination-bullet",
              disabledClass: "swiper-mobile-disabled",
              hiddenClass: "swiper-mobile-hidden",
              bulletActiveClass: "swiper-pagination-bullet-active",
            },
            modules: [FreeMode, Thumbs, Pagination],
          },
          768: {
            direction: "horizontal",
            slidesPerView: 1,
            pagination: {
              el: ".swiper-pagination",
              enabled: false,
            },
            navigation: {
              enabled: true,
            },
            modules: [FreeMode, Thumbs, Navigation],
          },
        }}
      >
        {loading ? (
          <SwiperSlide>
            <div className="h-full w-full bg-gray-200 animate-pulse"></div>
          </SwiperSlide>
        ) : (
          productImage
        )}
        {product?.data?.item?.price?.discount?.active &&
          renderDiscountPercentage({ price: product?.data?.item?.price })}
        {stickers?.length > 0 && renderStickers({ stickers })}
      </Swiper>
      <Swiper
        autoHeight
        onSwiper={(swiper) => setThumbsSwiper(swiper)}
        spaceBetween={10}
        slidesPerView={0}
        loop={true}
        breakpoints={{
          320: {
            direction: "horizontal",
            slidesPerView: 0,
            thumbs: {
              enabled: false,
            },
            modules: [],
          },
          768: {
            direction: "vertical",
            slidesPerView: 4.25,
            enabled: true,
            loop: true,
            allowSlidePrev: true,
            modules: [FreeMode, Thumbs],
          },
        }}
        freeMode={true}
        className={`${classes.mySwiper} mySwiper max-md:!hidden !relative`}
      >
        {" "}
        {thumbImage}
      </Swiper>
      {modalImage && (
        <div
          className={`fixed md:hidden top-0 left-0 w-full h-full bg-black/80 z-[999999] flex items-center justify-center`}
        >
          <div className="relative w-full h-full">
            <Swiper
              modules={[Pagination, Zoom]}
              pagination={true}
              direction={"vertical"}
              zoom={{
                maxRatio: 2.5,
                toggle: true,
                minRatio: 1,
              }}
              initialSlide={productGallery?.findIndex(
                (item) => item?.image === modalImage
              )}
              className={`${classes.mySwiper2} modalSwiper swiper-zoom-container`}
              breakpoints={{
                0: {
                  direction: "vertical",
                  slidesPerView: 1,
                  pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                    enabled: true,
                    bulletClass: "swiper-pagination-bullet",
                    bulletActiveClass: "swiper-pagination-bullet-active",
                  },
                },
              }}
            >
              {productGallery?.map((image, index) => {
                return (
                  <SwiperSlide key={index} className="w-full">
                    <div className="swiper-zoom-container">
                      <Image
                        src={image?.image}
                        alt={`Croonus`}
                        layout="fill"
                        objectFit="cover"
                        priority={true}
                        className="cursor-pointer w-full h-auto"
                      />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
          <i
            className={`fas fa-times absolute top-2 left-2 z-50 text-[#215352] bg-white rounded-xl px-2 py-1 text-xl cursor-pointer`}
            onClick={() => {
              setModalImage(null);
            }}
          ></i>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
