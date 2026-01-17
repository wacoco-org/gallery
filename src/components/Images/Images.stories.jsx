import Images from "./Images";

export default {
    title: "Components/Images",
    component: Images,
};

/**
 * Mock the global fetch used inside Images.jsx
 */
const mockData = [
    {
        key: "s3/food/bap_kitchen_01.webp",
        url: "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/s3/food/bap_kitchen_01.webp",
    },
    {
        key: "s3/food/bap_kitchen_02.webp",
        url: "https://hansik-dummy-images.s3.eu-north-1.amazonaws.com/s3/food/bap_kitchen_02.webp",
    },
];

function mockFetchOnce(data) {
    global.fetch = () =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(data),
        });
}

export const Default = () => {
    mockFetchOnce(mockData);
    return <Images />;
};

export const Empty = () => {
    mockFetchOnce([]);
    return <Images />;
};

export const Error = () => {
    global.fetch = () =>
        Promise.resolve({
            ok: false,
        });

    return <Images />;
};
