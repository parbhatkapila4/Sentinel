"use client";

interface Product {
  name: string;
  brand: string;
  quantity: number;
  price: number;
  earning: number;
  icon: string;
}

interface BestSellingProductProps {
  products?: Product[];
}

const defaultProducts: Product[] = [
  {
    name: "Nike Air Max Shoe",
    brand: "Nike",
    quantity: 1250,
    price: 95.0,
    earning: 118750,
    icon: "👟",
  },
  {
    name: "Nike Air Jordan",
    brand: "Nike",
    quantity: 1850,
    price: 27.0,
    earning: 49950,
    icon: "👟",
  },
  {
    name: "MacBook Pro",
    brand: "Apple",
    quantity: 40,
    price: 85.0,
    earning: 3400,
    icon: "💻",
  },
  {
    name: "Amazon Echo",
    brand: "Amazon",
    quantity: 95,
    price: 34.0,
    earning: 3230,
    icon: "📱",
  },
  {
    name: "iPhone 16 Pro Max",
    brand: "Apple",
    quantity: 80,
    price: 36.0,
    earning: 2880,
    icon: "📱",
  },
  {
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    quantity: 120,
    price: 32.0,
    earning: 3840,
    icon: "📱",
  },
];

export function BestSellingProduct({
  products = defaultProducts,
}: BestSellingProductProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">
          Best Selling Product
        </h3>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1f1f1f]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-white uppercase tracking-wider">
                Product Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white uppercase tracking-wider">
                Brand
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white uppercase tracking-wider">
                Quantity
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white uppercase tracking-wider">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-white uppercase tracking-wider">
                Earning
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={index}
                className="border-b border-[#1a1a1a] last:border-0 hover:bg-[#151515] transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl opacity-70">{product.icon}</span>
                    <span className="text-sm text-white">{product.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-[#8a8a8a]">
                    {product.brand}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-white">
                    {product.quantity.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-white">
                    ${product.price.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-semibold text-white">
                    $
                    {product.earning.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
