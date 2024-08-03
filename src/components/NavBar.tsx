const NavBar = () => {
  return (
    <div className="sticky top-0 z-50 flex w-full items-center justify-center bg-white pb-3 pt-3 md:border-b-[1px] md:border-b-gray-200">
      <span className="mt-2 text-xl font-bold leading-tight md:mx-6 lg:text-2xl">
        <div>TracerTag</div>
        <div className="text-center text-xs font-normal text-gray-500 md:text-start lg:text-sm">
          A state-of-the-art labelling software
        </div>
      </span>
      <div className="ml-auto hidden h-full md:flex [&>*]:flex [&>*]:items-center"></div>
    </div>
  );
};

export default NavBar;
