import { useEffect, useMemo, useState } from "react";
import Image from "./Image";
import styles from "./Images.module.css";

const INDEX_URL =
    "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/index.json";

const HARD_CODED_META = {
    author: "Hansik Studio",
    license: "CC BY (demo)",
    camera: "DemoCam X1",
    location: "Stockholm, SE",
    tags: ["demo", "placeholder", "gallery"],
    description:
        "Hardcoded metadata for now. Replace with real fields once your index.json includes them.",
};

export default function Images() {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null); // { app, key, url }

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

    // DETAIL VIEW (grid hidden)
    if (selected) {
        const filename =
            (selected.key || "").split("/").pop() || selected.app || "image";

        // all sizes use the SAME URL; only the rendered size changes
        const src = selected.url;

        return (
            <div className={styles.detail}>
                <button
                    type="button"
                    className={styles.detail__back}
                    onClick={() => setSelected(null)}
                >
                    ← Back
                </button>

                <div className={styles.detail__header}>
                    <h2 className={styles.detail__title}>{filename}</h2>
                    <div className={styles.detail__sub}>
                        <span>App: {selected.app}</span>
                        <span>Key: {selected.key}</span>
                    </div>
                </div>

                <div className={styles.detail__meta}>
                    <div><strong>Author:</strong> {HARD_CODED_META.author}</div>
                    <div><strong>License:</strong> {HARD_CODED_META.license}</div>
                    <div><strong>Camera:</strong> {HARD_CODED_META.camera}</div>
                    <div><strong>Location:</strong> {HARD_CODED_META.location}</div>
                    <div>
                        <strong>Tags:</strong> {HARD_CODED_META.tags.join(", ")}
                    </div>
                    <p className={styles.detail__desc}>{HARD_CODED_META.description}</p>
                </div>

                <div className={styles.detail__sizes}>
                    <div className={styles.detail__card}>
                        <div className={styles.detail__label}>Small</div>
                        <Image src={src} alt={filename} className={styles.imgSmall} />
                    </div>

                    <div className={styles.detail__card}>
                        <div className={styles.detail__label}>Medium</div>
                        <Image src={src} alt={filename} className={styles.imgMedium} />
                    </div>

                    <div className={styles.detail__card}>
                        <div className={styles.detail__label}>Large</div>
                        <Image src={src} alt={filename} className={styles.imgLarge} />
                    </div>

                    <div className={styles.detail__card}>
                        <div className={styles.detail__label}>Full width</div>
                        <Image src={src} alt={filename} className={styles.imgFull} />
                    </div>
                </div>
            </div>
        );
    }

    // GRID VIEW
    return (
        <div className={styles.images}>
            {grouped.map(([app, arr]) => (
                <section key={app} className={styles.images__section}>
                    <h2 className={styles.images__title}>{app}</h2>

                    <div className={styles.images__grid}>
                        {arr.map((entry) => {
                            const alt =
                                (entry.key || "").split("/").pop() || entry.app || "image";
                            return (
                                <button
                                    key={entry.key}
                                    type="button"
                                    className={styles.imageButton}
                                    onClick={() => setSelected(entry)}
                                >
                                    <div className={styles.image}>
                                        <Image src={entry.url} alt={alt} />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            ))}
        </div>
    );
}
