import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { useUser } from "@clerk/nextjs";

import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { transformationTypes } from "@/constants";
import { formUrlQuery } from "@/lib/utils";

import { Button } from "../ui/button";
import { Search } from "./Search";
import { IImage } from "@/lib/database/models/image.model";


const fetchUserImages = async (page: number): Promise<{ images: IImage[], totalPages: number }> => {
  console.log(`Fetching images for page ${page}`);
  const response = await fetch(`/api/images?page=${page}`);
  if (!response.ok) {
    console.error('Failed to fetch images:', response.statusText);
    throw new Error('Failed to fetch images');
  }
  const data = await response.json();
  console.log('Fetched data:', data);
  return data;
};

export const Collection = ({
  hasSearch = false,
  initialImages = [],
  totalPages: initialTotalPages = 1,
  page: initialPage = 1,
}: {
  initialImages?: IImage[];
  totalPages?: number;
  page?: number;
  hasSearch?: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();

  const [images, setImages] = useState<IImage[]>(initialImages);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [page, setPage] = useState<number>(initialPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadImages = async () => {
    if (!isUserLoaded || !isSignedIn) {
      console.log('User not loaded or not signed in');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting to load images');
      const data = await fetchUserImages(page);
      console.log('Received data:', data);
      setImages(data.images);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error in loadImages:', error);
      setError('Failed to fetch images. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      loadImages();
    }
  }, [isUserLoaded, isSignedIn, page]);

  // PAGINATION HANDLER
  const onPageChange = (action: string) => {
    const pageValue = action === "next" ? Number(page) + 1 : Number(page) - 1;
    const newUrl = formUrlQuery({
      searchParams: searchParams,
      key: "page",
      value: pageValue.toString(),
    });
    router.push(newUrl, { scroll: false });
    setPage(pageValue);
  };

  console.log('Rendering Collection. Images:', images.length, 'Loading:', isLoading, 'Error:', error);

  if (!isUserLoaded) {
    return <div>Loading user data...</div>;
  }

  if (!isSignedIn) {
    return <div>Please log in to view your images.</div>;
  }

  return (
    <>
      <div className="collection-heading">
        <h2 className="h2-bold text-dark-600">Your Recent Edits</h2>
        {hasSearch && <Search />}
      </div>

      {isLoading ? (
        <div className="collection-empty">
          <p className="p-20-semibold">Loading...</p>
        </div>
      ) : error ? (
        <div className="collection-empty">
          <p className="p-20-semibold text-red-500">{error}</p>
        </div>
      ) : images.length > 0 ? (
        <ul className="collection-list">
          {images.map((image) => (
            <Card image={image} key={image._id} />
          ))}
        </ul>
      ) : (
        <div className="collection-empty">
          <p className="p-20-semibold">No images found</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent className="flex w-full">
            <Button
              disabled={Number(page) <= 1 || isLoading}
              className="collection-btn"
              onClick={() => onPageChange("prev")}
            >
              <PaginationPrevious className="hover:bg-transparent hover:text-white" />
            </Button>

            <p className="flex-center p-16-medium w-fit flex-1">
              {page} / {totalPages}
            </p>

            <Button
              className="button w-32 bg-purple-gradient bg-cover text-white"
              onClick={() => onPageChange("next")}
              disabled={Number(page) >= totalPages || isLoading}
            >
              <PaginationNext className="hover:bg-transparent hover:text-white" />
            </Button>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

const Card = ({ image }: { image: IImage }) => {
  return (
    <li>
      <Link href={`/transformations/${image._id}`} className="collection-card">
        <CldImage
          src={image.publicId}
          alt={image.title}
          width={image.width || 100} // Provide a default value if width is undefined
          height={image.height || 100} // Provide a default value if height is undefined
          {...(image.config as any)} // Cast to any to avoid type issues with spreading
          loading="lazy"
          className="h-52 w-full rounded-[10px] object-cover"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
        <div className="flex-between">
          <p className="p-20-semibold mr-3 line-clamp-1 text-dark-600">
            {image.title}
          </p>
          <Image
            src={`/assets/icons/${
              transformationTypes[
                image.transformationType as keyof typeof transformationTypes
              ].icon
            }`}
            alt={image.title}
            width={24}
            height={24}
          />
        </div>
      </Link>
    </li>
  );
};