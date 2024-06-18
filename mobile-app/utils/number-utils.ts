export const formatStatNumber = (n: number) => {
  let number: string | number = n;
  const categories = [
    { value: 1000000000, char: "B" },
    { value: 1000000, char: "M" },
    { value: 1000, char: "K" },
  ];
  for (const { value, char } of categories) {
    if (number >= value) {
      number = (number / value).toString();
      const arr = number.includes(".") ? number.split(".") : [number];
      return (
        arr[0] +
        (arr[1] && arr[1].charAt(0) !== "0" ? "," + arr[1].charAt(0) : "") +
        char
      );
    }
  }
  return number;
};
