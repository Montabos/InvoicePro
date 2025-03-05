const InvoiceItem = ({ item, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...item, [name]: value });
  };

  return (
    <div>
      <input
        type="number"
        name="quantity"
        value={item.quantity}
        onChange={handleChange}
      />
      <input
        type="number"
        name="price"
        value={item.price}
        onChange={handleChange}
      />
    </div>
  );
};

export default InvoiceItem;
