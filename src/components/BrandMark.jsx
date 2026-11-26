function BrandMark({ className = 'h-6 w-6' }) {
  return (
    <img
      src="/advokastra-mark.svg"
      alt=""
      aria-hidden="true"
      draggable="false"
      className={className}
    />
  );
}

export default BrandMark;
