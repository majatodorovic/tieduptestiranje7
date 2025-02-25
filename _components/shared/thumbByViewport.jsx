"use client";
import {
  useAddToWishlist,
  useIsInWishlist,
  useRemoveFromWishlist,
} from "@/hooks/croonus.hooks";
import { Prices } from "@/_components/shared/prices";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { convertHttpToHttps } from "@/helpers/convertHttpToHttps";
import { pushToDataLayer } from "@/_services/data-layer";
import { get as GET } from "@/app/api/api";
import { useQuery } from "@tanstack/react-query";

const ThumbByViewport = ({
  id,
  categoryId = "*",
  refreshWishlist = () => {},
  is_details = false,
}) => {
  const [isInView, setIsInView] = useState(false);
  const thumbRef = useRef(null);

  //IntersectionObserver for visibility detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (thumbRef.current) {
      observer.observe(thumbRef.current);
    }

    return () => {
      if (thumbRef.current) {
        observer.unobserve(thumbRef.current);
      }
    };
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ["productThumbByViewport", id],
    queryFn: async () => {
      return await GET(
        `/product-details/thumb/${id}?categoryId=${categoryId}`
      ).then((res) => {
        return res?.payload;
      });
    },
    enabled: isInView,
    refetchOnWindowFocus: false,
  });
  const { data: wishlist } = useIsInWishlist({ id: id, enabled: isInView });

  const { mutate: addToWishlist, isSuccess: isAdded } = useAddToWishlist();
  const { mutate: removeFromWishlist, isSuccess: isRemoved } =
    useRemoveFromWishlist();

  const wishlist_data = {
    is_in_wishlist: wishlist?.exist,
    id: wishlist?.wishlist_item_id,
  };

  useEffect(() => {
    if (isInView) {
      refreshWishlist();
    }
  }, [isInView, isAdded, isRemoved]);

  const renderDiscountPercentage = ({
    price: {
      discount: { campaigns },
    },
  }) => (
    <div className="absolute right-2 top-2 z-[5] text-white text-[13px] flex flex-col gap-2">
      {campaigns?.map(({ calc: { original, price } }, index) => {
        const discount = Math.round(
          ((Number(original) - Number(price)) / Number(original)) * 100
        );
        return (
          <p
            key={index}
            className="bg-[#215352] px-[0.85rem] py-1 rounded-lg font-bold"
          >
            - {discount}%
          </p>
        );
      })}
    </div>
  );

  const renderStickers = ({ stickers }) => (
    <div className="absolute left-2 top-2 z-[5] text-white text-[13px] flex flex-col gap-2">
      {stickers?.map(({ name }, i) => (
        <p
          key={`sticker-${i}`}
          className="bg-[#E7DCD1] w-fit px-[0.85rem] py-1 text-black rounded-lg font-bold group-hover:bg-[#215352] group-hover:text-white transition-colors duration-500"
        >
          {name}
        </p>
      ))}
    </div>
  );

  return (
    <div
      ref={thumbRef}
      className="col-span-1 flex flex-col relative group !h-full"
    >
      {product?.price?.discount?.active &&
        renderDiscountPercentage({ price: product?.price })}
      {product?.stickers?.length > 0 &&
        renderStickers({ stickers: product?.stickers })}

      <div className="!relative !overflow-hidden">
        <Swiper
          modules={[Pagination]}
          pagination={true}
          rewind={product?.image?.length > 1}
          breakpoints={{
            1024: {
              pagination: { enabled: false },
            },
          }}
          className="categoryImageSwiper !relative !overflow-hidden"
        >
          {(product?.image_data ?? []).map(
            (
              { url, descriptions: { alt }, file_data: { height, width } },
              index
            ) => (
              <SwiperSlide key={index} className="!overflow-hidden !relative">
                <Link href={`/${product?.link?.link_path}`} className="flex-1">
                  <Image
                    loading="lazy"
                    src={convertHttpToHttps(url ?? "")}
                    alt={alt ?? product?.basic_data?.name}
                    sizes="100vw"
                    width={width ?? 0}
                    height={height ?? 0}
                    className="!w-full !h-auto group-hover:scale-110 transition-all duration-500 aspect-square"
                  />
                </Link>
              </SwiperSlide>
            )
          )}
        </Swiper>
      </div>

      <div className="flex flex-wrap flex-col items-start mt-auto pt-[0.813rem] w-full">
        <div className="flex items-start justify-between w-full relative">
          <Link
            href={`/${product?.link?.link_path}`}
            className="uppercase text-[0.813rem] group-hover:text-[#215352] max-sm:line-clamp-2"
          >
            {product?.basic_data?.name}
          </Link>
          {isInView && (
            <div
              onClick={() => {
                if (wishlist_data?.is_in_wishlist) {
                  pushToDataLayer("remove_from_wishlist", product);
                  removeFromWishlist({ id: wishlist_data?.id });
                } else {
                  addToWishlist({ id: product?.basic_data?.id_product });
                  pushToDataLayer("add_to_wishlist", product);
                }
              }}
              className="rounded-full cursor-pointer"
            >
              <Image
                src={
                  wishlist_data?.is_in_wishlist
                    ? "/heart-active1.png"
                    : "/heart1.png"
                }
                alt="wishlist"
                height={15}
                width={15}
                className="cursor-pointer hover:scale-110 transition-all duration-200"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-3 text-left">
        <Prices
          price={product?.price}
          inventory={product?.inventory}
          is_details={is_details}
        />
      </div>
    </div>
  );
};

export default ThumbByViewport;
