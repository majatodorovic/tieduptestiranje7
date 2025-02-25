"use client";
import Filter from "./Filter";
import { sortKeys } from "@/helpers/const";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const Filters = ({
  availableFilters,
  selectedFilters,
  setSelectedFilters,
  setSort,
  sort,
  pagination,
  products,
  setProductsPerView,
  productsPerView,
  setTempSelectedFilters,
  setLastSelectedFilterKey,
  setChangeFilters,
  filter,
  setPage,
}) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [openSort, setOpenSort] = useState({
    open: false,
    key: {
      field: sort?.field,
      direction: sort?.direction,
    },
  });

  const filterRef = useRef(null);

  const handleClickInsideAndOutside = (e) => {
    // Close the filter if the click occurred outside of it or if the user clicked on the filter

    if (
      (!filterRef?.current?.contains(e.target) ||
        e.target?.classList?.contains("filter")) &&
      openIndex !== null
    ) {
      setOpenIndex(null);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickInsideAndOutside);
    return () => {
      document.removeEventListener("click", handleClickInsideAndOutside);
    };
  }, [openIndex]);

  const sortRef = useRef(null);

  const handleClickInsideAndOutsideSort = (e) => {
    if (
      (!sortRef?.current?.contains(e.target) ||
        e.target?.classList?.contains("sortref")) &&
      openSort !== false
    ) {
      setOpenSort({
        ...openSort,
        open: false,
      });
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickInsideAndOutsideSort);
    return () => {
      document.removeEventListener("click", handleClickInsideAndOutsideSort);
    };
  }, [openSort]);

  const params = useSearchParams();
  const sortParam = params?.get("sort") ?? "_";

  const keys = sortParam?.split("_");

  useEffect(() => {
    if (sortParam) {
      setSort({
        field: keys[0],
        direction: keys[1],
      });
    }
  }, [sortParam]);

  return (
    <>
      <div className=" mx-[50px] flex items-center justify-between bg-[#b89980] text-black px-[2rem] font-normal text-[0.85rem]">
        <div className={`flex items-center gap-[4.5rem]`}>
          {(availableFilters ?? []).map((filter, index) => {
            const isOpen = openIndex === index;
            return (
              <div className="relative max-lg:hidden filter">
                <div
                  className="relative select-none cursor-pointer filter"
                  key={filter?.id}
                  onClick={() => {
                    setOpenIndex(openIndex === index ? null : index);
                  }}
                >
                  <div
                    className={`relative py-[0.65rem] flex items-center filter gap-2`}
                  >
                    <p
                      className={`text-base text-center filter font-light ${
                        openIndex === index ? "text-white" : "hover:text-white"
                      }`}
                    >
                      {filter?.attribute?.name}
                    </p>
                    <Image
                      className={
                        isOpen
                          ? `rotate-180 filter transition-all duration-500`
                          : `rotate-0 filter transition-all duration-500`
                      }
                      src={`/icons/chevron.png`}
                      alt={` `}
                      width={15}
                      height={15}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div
                    ref={filterRef}
                    className={` z-[20] ${
                      filter?.name === "Cena" && "w-[230px]"
                    } w-[150px] top-[43px] bg-white border-l border-r border-b border-[#f2f2f2] border-t left-0 absolute font-normal`}
                  >
                    <div className="pb-3.5 filter">
                      <Filter
                        filter={filter}
                        availableFilters={availableFilters}
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                        setTempSelectedFilters={setTempSelectedFilters}
                        setLastSelectedFilterKey={setLastSelectedFilterKey}
                        setChangeFilters={setChangeFilters}
                        setPage={setPage}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {selectedFilters?.length > 0 && (
          <div
            className="mr-auto ml-[6rem] relative select-none cursor-pointer"
            onClick={() => {
              setSelectedFilters([]);
              setChangeFilters(true);
              setOpenIndex(null);
            }}
          >
            <div className={`relative flex items-center gap-2`}>
              <p className="font-medium text-base text-center">Izbrišite sve</p>
              <i className="fa-solid fa-times text-lg  mr-2"></i>
            </div>
          </div>
        )}
        <div className={`flex items-center gap-10`}>
          <div className="col-span-1 col-start-7 flex items-center justify-end relative">
            <p className=" font-light text-base text-center">
              {pagination?.total_items} Proizvoda
            </p>
          </div>
          <div className="col-span-1 col-start-8 flex items-center justify-end relative">
            <div
              className="flex gap-2 items-center cursor-pointer"
              onClick={() =>
                setOpenSort({
                  ...openSort,
                  open: !openSort.open,
                })
              }
            >
              <p
                className={`text-base font-light text-center ${
                  openSort?.open ? "text-white" : "hover:text-white"
                }`}
              >
                Sortiranje
              </p>
              <Image
                className={
                  openSort.open
                    ? `rotate-180 transition-all duration-500`
                    : `rotate-0 transition-all duration-500`
                }
                src={`/icons/chevron.png`}
                alt={`TiedUp`}
                width={15}
                height={15}
              />
            </div>
            {openSort?.open && (
              <div
                ref={sortRef}
                className="absolute sortref z-[2] border border-[#f2f2f2] right-[-100px] top-[33px] flex flex-col items-center justify-end w-[250px]"
              >
                {sortKeys?.map((key) => {
                  const isActive =
                    openSort?.key?.field === key?.field &&
                    openSort?.key?.direction === key?.direction;
                  return (
                    <div
                      className={`flex sortref items-center text-black justify-start w-full py-2 px-4 cursor-pointer text-[0.875rem] ${
                        isActive ? "bg-white" : "bg-white "
                      }`}
                      onClick={() =>
                        setSort({
                          field: key?.field,
                          direction: key?.direction,
                        })
                      }
                    >
                      <p
                        className={` sortref ${
                          isActive ? ` text-[#215352]` : ` hover:text-[#215352]`
                        } text-[1rem] text-center font-light`}
                        onClick={() =>
                          setOpenSort({
                            open: false,
                            key: {
                              field: key?.field,
                              direction: key?.direction,
                            },
                          })
                        }
                      >
                        {key?.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="col-span-1 col-start-9 flex items-center gap-3 justify-end relative md:hidden lg:flex">
            <p className="font-light text-base text-center">Prikaz:</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setProductsPerView(2)}
                className={`text-base  ${
                  productsPerView === 2 ? `text-white` : `text-black`
                }`}
              >
                2
              </button>{" "}
              |{" "}
              <button
                onClick={() => setProductsPerView(3)}
                className={`2xl:hidden text-base ${
                  productsPerView === 3 ? `text-white` : `text-black`
                }`}
              >
                3
              </button>
              <button
                onClick={() => setProductsPerView(4)}
                className={`max-2xl:hidden text-base ${
                  productsPerView === 4 ? `text-white` : `text-black`
                }`}
              >
                4
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Filters;
