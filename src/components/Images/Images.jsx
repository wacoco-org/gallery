import { useEffect, useMemo, useState } from "react";
import Image from "./Image";

const INDEX_URL =
    "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/s3/index.js";

export default function Images() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                // index.js is an ES module exporting the array as default
                const mod = await import(/* @vite-ignore */ `${INDEX_URL}?t=${Date.now()}`);
                if (!cancelled) setItems(mod.default || []);
            } catch (e) {
                if (!cancelled) setError(e?.message || "Failed to load index");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const grouped = useMemo(() => {
        const map = new Map();
        for (const item of items) {
            if (!item?.app || !item?.url) continue;
            if (!map.has(item.app)) map.set(item.app, []);
            map.get(item.app).push(item);
        }
        // stable: app name sort + key sort
        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([app, arr]) => [
                app,
                arr.slice().sort((x, y) => (x.key || "").localeCompare(y.key || "")),
            ]);
    }, [items]);

    if (error) return <div>Error: {error}</div>;
    if (!items.length) return <div>Loading…</div>;

    return (
        <div className="images">
            {grouped.map(([app, arr]) => (
                <section key={app} className="images__section">
                    <h2 className="images__title">{app}</h2>

                    <div className="images__grid">
                        {arr.map((entry) => (
                            <Image
                                key={entry.key}
                                src={entry.url}
                                alt={(entry.key || "").split("/").pop() || entry.app}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
