export const TOWNS = {
  // ── Trivandrum ZONE ──
  "Trivandrum": {hub:"Trivandrum", mins:0, aliases:["trivandrum","tvm","Trivandrum"]},
  "Neyyattinkara": {hub:"Trivandrum", mins:30, aliases:["neyyattinkara","nta"]},
  "Nedumangad": {hub:"Trivandrum", mins:25, aliases:["nedumangad"]},
  "Attingal": {hub:"Trivandrum", mins:35, aliases:["attingal"]},
  "Kattakada": {hub:"Trivandrum", mins:28, aliases:["kattakada"]},
  "Varkala": {hub:"Trivandrum", mins:45, aliases:["varkala"]},
  "Kilimanoor": {hub:"Trivandrum", mins:50, aliases:["kilimanoor"]},
  "Venjaramoodu": {hub:"Trivandrum", mins:32, aliases:["venjaramoodu"]},
  "Vellarada": {hub:"Trivandrum", mins:38, aliases:["vellarada"]},
  "Palode": {hub:"Trivandrum", mins:42, aliases:["palode"]},
  "Poovar": {hub:"Trivandrum", mins:40, aliases:["poovar"]},
  "Vizhinjam": {hub:"Trivandrum", mins:20, aliases:["vizhinjam"]},
  "Kovalam": {hub:"Trivandrum", mins:18, aliases:["kovalam"]},
  "Pappanamcode": {hub:"Trivandrum", mins:10, aliases:["pappanamcode"]},
  "Peroorkada": {hub:"Trivandrum", mins:12, aliases:["peroorkada"]},
  "Kaniyapuram": {hub:"Trivandrum", mins:22, aliases:["kaniyapuram"]},
  "Aryanad": {hub:"Trivandrum", mins:35, aliases:["aryanad"]},
  "Vellanad": {hub:"Trivandrum", mins:30, aliases:["vellanad"]},
  "Vithura": {hub:"Trivandrum", mins:55, aliases:["vithura"]},
  "Parassala": {hub:"Trivandrum", mins:35, aliases:["parassala"]},

  // ── KOLLAM ZONE ──
  "Kollam": {hub:"Kollam", mins:0, aliases:["kollam","quilon"]},
  "Punalur": {hub:"Kollam", mins:45, aliases:["punalur"]},
  "Karunagappalli": {hub:"Kollam", mins:22, aliases:["karunagappally","karunagapalli"]},
  "Kottarakkara": {hub:"Kollam", mins:30, aliases:["kottarakkara","kottarakara"]},
  "Chadayamangalam": {hub:"Kollam", mins:35, aliases:["chadayamangalam","shadayamangalam"]},
  "Chathanoor": {hub:"Kollam", mins:20, aliases:["chathanoor","chathannoor"]},
  "Kulathupuzha": {hub:"Kollam", mins:55, aliases:["kulathupuzha"]},
  "Pathanapuram": {hub:"Kollam", mins:48, aliases:["pathanapuram"]},
};

export const HUB_DIST = {
  "Trivandrum-Kollam": 70,
  "Trivandrum-Kottayam": 140,
  "Trivandrum-Ernakulam": 210,
  "Kollam-Kottayam": 80,
  "Kottayam-Ernakulam": 80,
  "Ernakulam-Thrissur": 80,
  "Thrissur-Palakkad": 70,
  "Palakkad-Kozhikode": 90,
  "Kozhikode-Kannur": 75,
  "Kannur-Kasaragod": 65,
};

export function getHubDist(
  h1: string,
  h2: string
) {
  if (h1 === h2) return 0;

  const k1 = `${h1}-${h2}`;
  const k2 = `${h2}-${h1}`;

  return (
    HUB_DIST[k1 as keyof typeof HUB_DIST] ||
    HUB_DIST[k2 as keyof typeof HUB_DIST] ||
    null
  );
}

export const KSRTC_CITY = {
  "Trivandrum": "443|Trivandrum (1)",
  "Kollam": "303|Kollam (2)",
  "Pathanamthitta": "312|Pathanamthitta (3)",
  "Alappuzha": "320|Alappuzha (4)",
  "Kottayam": "327|Kottayam (5)",
  "Ernakulam": "340|Ernakulam (7)",
  "Thrissur": "506|Thrissur (8)",
  "Palakkad": "513|Palakkad (9)",
  "Malappuram": "519|Malappuram (10)",
  "Kozhikode": "10072|Kozhikode (11)",
  "Kalpetta": "529|Kalpetta (12)",
  "Kannur": "532|Kannur (13)",
  "Kasaragod": "536|Kasaragod (14)",
};
