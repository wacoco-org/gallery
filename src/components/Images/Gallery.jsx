import { useEffect, useMemo, useRef, useState } from "react";
import Images from "./Images";

const INDEX_URL =
    "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/index.js";
const GLOBAL_NAME = "__IMAGE_INDEX__";

export default function Gallery({
                                    pollMs = 15000,
                                    fastFirstLoad = true,
                                    onlyIfChanged = true,
                                }) {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    const lastEtagRef = useRef(null);
    const lastModifiedRef = useRef(null);

    async function loadIndexViaScript({ useCacheBuster = false } = {}) {
        const url = useCacheBuster ? `${INDEX_URL}?t=${Date.now()}` : INDEX_URL;

        // HEAD change-detection (optional)
        if (onlyIfChanged) {
            try {
                const head = await fetch(url, { method: "HEAD", cache: "no-store" });
                if (head.ok) {
                    const etag = head.headers.get("etag");
                    const lastMod = head.headers.get("last-modified");

                    const sameEtag =
                        etag && lastEtagRef.current && etag === lastEtagRef.current;
                    const sameLastMod =
                        lastMod &&
                        lastModifiedRef.current &&
                        lastMod === lastModifiedRef.current;

                    if (sameEtag || sameLastMod) return; // no change

                    if (etag) lastEtagRef.current = etag;
                    if (lastMod) lastModifiedRef.current = lastMod;
                }
            } catch {
                // ignore; still try to load script
            }
        }

        // Clear previous value so we can detect a bad load
        delete window[GLOBAL_NAME];

        await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = url;
            s.async = true;

            s.onload = () => {
                s.remove();
                resolve();
            };
            s.onerror = () => {
                s.remove();
                reject(new Error(`Failed to load script: ${INDEX_URL}`));
            };

            document.head.appendChild(s);
        });

        const data = window[GLOBAL_NAME];
        if (!Array.isArray(data)) {
            throw new Error(
                `index.js loaded but window.${GLOBAL_NAME} was not an array (did you generate window.${GLOBAL_NAME} = [...] ?) `
            );
        }

        setItems(data);
        setError(null);
    }

    useEffect(() => {
        let cancelled = false;
        let timer = null;

        const tick = async (first = false) => {
            try {
                await loadIndexViaScript({ useCacheBuster: first && fastFirstLoad });
            } catch (e) {
                if (!cancelled) setError(e?.message || "Failed to load index");
            } finally {
                if (!cancelled) timer = setTimeout(() => tick(false), pollMs);
            }
        };

        tick(true);

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [pollMs, fastFirstLoad, onlyIfChanged]);

    const value = useMemo(() => items, [items]);

    return (
        <div>
            {error ? <div>Error: {error}</div> : null}
            <Images items={value} />
        </div>
    );
}
