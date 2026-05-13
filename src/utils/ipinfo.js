export async function getIpInfo(ip) {
  const res = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN}`);
  const data = await res.json();

  return {
    ip,
    country: data.country,
    city: data.city,

    // carrier / ISP
    isp: data.org,

    // location
    loc: data.loc,

    // privacy signals
    isVPN:
      data.privacy?.vpn ||
      data.privacy?.proxy ||
      data.privacy?.tor ||
      false,
  };
}