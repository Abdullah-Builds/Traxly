import prisma from "../config/prisma.js";
import geoip from "geoip-lite";
import ClickEvent from "../models/clickEvent.model.js";
import LinkStats from "../models/linkStats.model.js";

import { UAParser } from "ua-parser-js";
import { getIpInfo } from "../utils/ipinfo.js";

/* ---------------- REFERRER SOURCE DETECTION ---------------- */

function getSource(referrer) {
    if (!referrer || referrer === "direct") {
        return "direct";
    }

    if (referrer.includes("wa.me")) return "whatsapp";
    if (referrer.includes("instagram.com")) return "instagram";
    if (referrer.includes("facebook.com")) return "facebook";
    if (referrer.includes("t.co")) return "twitter";
    if (referrer.includes("google")) return "google";

    return "other";
}

/* ---------------- REDIRECT CONTROLLER ---------------- */

export const redirectShortUrl = async (req, res) => {
    try {
        const { slug } = req.params;

        /* ---------------- FIND SHORT URL ---------------- */

        const shortUrl = await prisma.shortUrl.findUnique({
            where: {
                slug,
            },
        });

        if (!shortUrl) {
            return res.status(404).json({
                message: "Short URL not found",
            });
        }

        /* ---------------- CHECK ACTIVE ---------------- */

        if (!shortUrl.is_active) {
            return res.status(403).json({
                message: "Link disabled",
            });
        }

        /* ---------------- CHECK EXPIRY ---------------- */

        if (
            shortUrl.expires_at &&
            new Date(shortUrl.expires_at) < new Date()
        ) {
            return res.status(403).json({
                message: "Link expired",
            });
        }

        /* ---------------- GET USER IP ---------------- */

        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress;

        /* ---------------- IP INFO ---------------- */

        const ipInfo = await getIpInfo(ip);

        /* ---------------- USER AGENT PARSING ---------------- */

        const parser = new UAParser(req.headers["user-agent"]);

        const result = parser.getResult();

        /* ---------------- GEO LOOKUP ---------------- */

        const geo = geoip.lookup(ip);
        const country = geo?.country || "unknown";
        const city = geo?.city || "unknown";


        /* ---------------- REFERRER ---------------- */

        const referrer = req.get("referer") || "direct";

        const source = getSource(referrer);

        /* ---------------- CLICK EVENT ---------------- */

        const clickData = {
            slug,

            workspace_id: shortUrl.workspace_id,

            ip: ipInfo.ip,

            country: ipInfo.country || "unknown",

            city: ipInfo.city || "unknown",

            loc: ipInfo.loc || null,

            carrier: ipInfo.isp || "unknown",

            is_vpn: ipInfo.isVPN || false,

            device: result.device.type || "desktop",

            browser: result.browser.name || "unknown",

            os: result.os.name || "unknown",

            referrer,

            source,
        };
        console.log(clickData)
        await ClickEvent.create(clickData);

        /* ---------------- UPDATE STATS ---------------- */

        let stats = await LinkStats.findOne({ slug });

        const today = new Date().toISOString().split("T")[0];

        if (!stats) {
            stats = await LinkStats.create({
                slug,

                workspace_id: shortUrl.workspace_id,

                total_clicks: 1,

                daily_clicks: [
                    {
                        date: today,
                        count: 1,
                    },
                ],
                location: [
                    {
                        loc: clickData.loc
                    }
                ],
                network: [
                    {
                        ip: clickData.ip,
                        carrier: clickData.carrier,
                        vpn: clickData.is_vpn,
                    }
                ],
                top_city: [
                    {
                    city: clickData.city
                    }
                ],
                top_countries: [
                    {
                        country: clickData.country,
                        count: 1,
                    },
                ],
                browser : [
                    {
                        browser : clickData.browser
                    }
                ],
                OS : [
                    {
                        os : clickData.os
                    }
                ],
                top_devices: [
                    {
                        device: clickData.device,
                        count: 1,
                    },
                ],
                source :[
                    {
                        source : clickData.source
                    }
                ],
                top_referrers: [
                    {
                        source: clickData.source,
                        count: 1,
                    },
                ],

                last_updated: new Date(),
            });
        } else {
            /* ---------------- TOTAL CLICKS ---------------- */

            stats.total_clicks += 1;

            stats.last_updated = new Date();

            /* ---------------- DAILY CLICKS ---------------- */

            const existingDay = stats.daily_clicks.find(
                (d) => d.date === today
            );

            if (existingDay) {
                existingDay.count += 1;
            } else {
                stats.daily_clicks.push({
                    date: today,
                    count: 1,
                });
            }

            /* ---------------- TOP COUNTRIES ---------------- */

            const existingCountry = stats.top_countries.find(
                (c) => c.country === clickData.country
            );

            if (existingCountry) {
                existingCountry.count += 1;
            } else {
                stats.top_countries.push({
                    country: clickData.country,
                    count: 1,
                });
            }

            /* ---------------- TOP DEVICES ---------------- */

            const existingDevice = stats.top_devices.find(
                (d) => d.device === clickData.device
            );

            if (existingDevice) {
                existingDevice.count += 1;
            } else {
                stats.top_devices.push({
                    device: clickData.device,
                    count: 1,
                });
            }

            /* ---------------- TOP REFERRERS ---------------- */

            const existingReferrer = stats.top_referrers.find(
                (r) => r.source === clickData.source
            );

            if (existingReferrer) {
                existingReferrer.count += 1;
            } else {
                stats.top_referrers.push({
                    source: clickData.source,
                    count: 1,
                });
            }

            await stats.save();
        }

        /* ---------------- REDIRECT USER ---------------- */

        return res.redirect(shortUrl.original_url);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};
