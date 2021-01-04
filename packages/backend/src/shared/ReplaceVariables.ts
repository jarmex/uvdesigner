export const ReplaceVariables = (
  strName: string,
  appdata = {},
  tempdata = {},
) => {
  if (!strName) return '';
  if (typeof strName !== 'string') return '';
  const regex = /\$([A-Za-z]+[A-Za-z0-9_]*)/gi;
  const retvalue = strName.match(regex);
  if (retvalue) {
    let retstr = strName;
    const combData: any = { ...appdata, ...tempdata };
    retvalue.forEach((item) => {
      retstr = retstr.replace(item, combData[item] || item);
    });
    return retstr;
  }
  return strName;
};
