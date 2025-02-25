import IndexSlider from "../IndexSlider/IndexSlider";

const HomepageBanners = ({ banners, mobileBanners }) => {
  return (
    <div className="mx-auto relative">
      <div className={`max-md:hidden`}>
        <IndexSlider banners={banners} />
      </div>
      <div className={`md:hidden`}>
        <IndexSlider banners={mobileBanners} />
      </div>
    </div>
  );
};

export default HomepageBanners;
