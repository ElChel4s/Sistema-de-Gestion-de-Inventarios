// Función para gestionar el envío del formulario de movimientos
export const handleSubmitMovement = (
  e: React.FormEvent,
  formData: any,
  currentMovement: any | null,
  setMovements: (movements: any[]) => void, 
  movements: any[],
  closeModal: () => void,
  addMovement: Function, 
  updateMovement: Function
) => {
  e.preventDefault();
    
  const dataToSubmit = {...formData};
  
  // Validar que haya al menos un producto
  if (dataToSubmit.products.length === 0) {
    alert("Debes añadir al menos un producto al movimiento");
    return;
  }

  // Si solo hay un producto, actualizar los campos legacy para mantener compatibilidad
  if (dataToSubmit.products.length === 1) {
    dataToSubmit.productId = dataToSubmit.products[0].productId;
    dataToSubmit.quantity = dataToSubmit.products[0].quantity;
  } else if (dataToSubmit.products.length > 0) {
    // Si hay múltiples productos, establecemos el primero como el principal para compatibilidad
    dataToSubmit.productId = dataToSubmit.products[0].productId;
    dataToSubmit.quantity = dataToSubmit.products[0].quantity;
  }
  
  if (currentMovement) {
    updateMovement(currentMovement.id, dataToSubmit, setMovements, movements);
  } else {
    addMovement(dataToSubmit, setMovements, movements);
  }
  
  closeModal();
};
