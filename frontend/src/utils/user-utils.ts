export const getNameInitials = (name: string) => {
  if (!name) {
    return "";
  }
  const nameArray = name.split(" ");
  if (nameArray.length === 1) {
    return name[0] + name[1];
  }
  return (
    nameArray[0].charAt(0).toUpperCase() + nameArray[1].charAt(0).toUpperCase()
  );
};
