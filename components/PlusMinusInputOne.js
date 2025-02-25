const PlusMinusInputOne = ({ quantity, maxAmount, updateCart, id }) => {
  return (
    <div className="bg-[#fbfbfb] border max-md:h-full  border-[#eaeaea] max-md:border-[#919191]">
      <div className="flex items-center w-full">
        <span
          className="cursor-pointer flex-1 text-lg select-none block pl-[12px] pr-[7px] py-[2px]"
          onClick={() => {
            if (quantity == 1) return;

            updateCart({
              id: id,
              quantity: quantity - 1,
              type: true,
            });
          }}
        >
          -
        </span>
        <input
          maxLength="2"
          max={maxAmount}
          type="number"
          value={quantity}
          onChange={(e) => {
            const value = e.target.value;
            const isNumber = /^\d+$/.test(value);

            if (!isNumber) return;

            updateCart({
              id: id,
              quantity: e.target.value,
              type: true,
            });
          }}
          className="w-[32px] text-center no-spinners mx-auto flex-1 bg-[#fbfbfb] focus:border-none focus:outline-none p-0 focus:ring-0 select-none text-sm border-none text-sm"
        />
        <span
          className="cursor-pointer flex-1 text-lg select-none block pl-[7px] pr-[12px] py-[2px]"
          onClick={() => {
            updateCart({
              id: id,
              quantity: quantity + 1,
              type: true,
            });
          }}
        >
          +
        </span>
      </div>
    </div>
  );
};

export default PlusMinusInputOne;
