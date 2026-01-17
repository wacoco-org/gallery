import { useEffect, useMemo, useState } from "react";
import Image from "./Image";
import styles from "./Images.module.css";

const INDEX_URL =
    "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/index.json";

export default function Images() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        fetch(`${INDEX_URL}?t=${Date.now()}`)
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to load index (${res.status})`);
                return res.json();
            })
            .then((data) => {
                if (!cancelled) setItems(Array.isArray(data) ? data : []);
            })
            .catch((e) => {
                if (!cancelled) setError(e?.message || "Failed to load index");
            });

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
        <div className={styles.images}>
            {grouped.map(([app, arr]) => (
                <section key={app} className={styles.images__section}>
                    <h2 className={styles.images__title}>{app}</h2>

                    <div className={styles.images__grid}>
                        {arr.map((entry) => (
                            <div key={entry.key} className={styles.image}>
                                <Image
                                    src={entry.url}
                                    alt={(entry.key || "").split("/").pop() || entry.app}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
