import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Control, FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Invoice } from "@shared/schema";

interface ItemsListProps {
  control: Control<Invoice>;
  register: UseFormRegister<Invoice>;
  errors: FieldErrors<Invoice>;
  setValue: UseFormSetValue<Invoice>;
  getValues: UseFormGetValues<Invoice>;
  watch: UseFormWatch<Invoice>;
}

export default function ItemsList({ register, errors, setValue, getValues, watch }: ItemsListProps) {
  const items = watch("items");
  
  const addItem = () => {
    const currentItems = getValues("items");
    setValue("items", [
      ...currentItems,
      { description: "", quantity: 1, price: 0 }
    ]);
  };
  
  const removeItem = (index: number) => {
    const currentItems = getValues("items");
    if (currentItems.length > 1) {
      setValue(
        "items",
        currentItems.filter((_, i) => i !== index)
      );
    }
  };
  
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  {...register(`items.${index}.description`)}
                  placeholder="Item description"
                  className="w-full"
                />
                {errors.items?.[index]?.description && (
                  <span className="text-xs text-destructive">
                    {errors.items[index]?.description?.message}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Input
                  {...register(`items.${index}.quantity`, {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0) {
                        setValue(`items.${index}.quantity`, value);
                      }
                    }
                  })}
                  type="number"
                  min="1"
                  className="w-20"
                />
              </TableCell>
              <TableCell>
                <Input
                  {...register(`items.${index}.price`, {
                    valueAsNumber: true,
                    onChange: (e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (value >= 0) {
                        setValue(`items.${index}.price`, value);
                      }
                    }
                  })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-24"
                />
              </TableCell>
              <TableCell className="text-right font-medium">
                ${(
                  watch(`items.${index}.quantity`) * 
                  watch(`items.${index}.price`)
                ).toFixed(2)}
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={addItem}
      >
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </Button>
    </div>
  );
}
