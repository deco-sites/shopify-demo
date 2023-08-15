import Image from "deco-sites/std/components/Image.tsx";
import Icon from "$store/components/ui/Icon.tsx";
import Button from "$store/components/ui/Button.tsx";
import QuantitySelector from "$store/components/ui/QuantitySelector.tsx";
import { useCart } from "deco-sites/std/packs/shopify/hooks/useCart.ts";
import { formatPrice } from "$store/sdk/format.ts";
import { sendEvent } from "$store/sdk/analytics.tsx";
import { useSignal } from "@preact/signals";
import { useCallback } from "preact/hooks";

interface Props {
  index: number;
  locale: string;
  currency: string;
}

function CartItem({ index, locale, currency }: Props) {
  const {
    cart,
    updateItems,
  } = useCart();
  const loading = useSignal(false);
  const item = cart.value?.cart?.lines?.nodes[index];

  if (item) {
    const {
      cost,
      merchandise,
      quantity,
    } = item;

    const { totalAmount, subtotalAmount, compareAtAmountPerQuantity } = cost;
    const total = subtotalAmount.amount;
    const listPrice = compareAtAmountPerQuantity.amount;

    const subTotal = listPrice * quantity;
    const { image, product, title, id } = merchandise;

    const isGift = totalAmount.amount < 0.01;

    const lines = cart.value?.cart?.lines;

    const withLoading = useCallback(
      <A,>(cb: (args: A) => void) => async (e: A) => {
        try {
          loading.value = true;
          await cb(e);
        } finally {
          loading.value = false;
        }
      },
      [loading],
    );

    return (
      <div
        class="grid grid-rows-1 gap-2"
        style={{
          gridTemplateColumns: "auto 1fr",
        }}
      >
        <Image
          style={{ aspectRatio: "108 / 150" }}
          src={image.url}
          alt={image.altText}
          width={108}
          height={150}
          class="h-full object-contain"
        />

        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span>{title + " - " + product.title}</span>
            <Button
              disabled={loading.value || isGift}
              loading={loading.value}
              class="btn-ghost btn-square"
              onClick={withLoading(async () => {
                await updateItems({
                  lines: {
                    id: item.id,
                    quantity: 0,
                  },
                });
              })}
            >
              <Icon id="Trash" size={24} />
            </Button>
          </div>
          <div class="flex items-center gap-2">
            <span class="line-through text-base-300 text-sm">
              {formatPrice(subTotal, currency, locale)}
            </span>
            <span class="text-sm text-secondary">
              {isGift ? "Grátis" : formatPrice(total, currency, locale)}
            </span>
          </div>

          <QuantitySelector
            disabled={loading.value || isGift}
            quantity={quantity}
            onChange={withLoading(async (quantity) => {
              await updateItems({
                lines: {
                  id: item.id,
                  quantity,
                },
              });
            })}
          />
        </div>
      </div>
    );
  }

  return <></>;
}

export default CartItem;
