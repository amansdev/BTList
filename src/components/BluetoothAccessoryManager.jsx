import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/Lock";

const BluetoothAccessoryManager = ({ maxAllowed = 9 }) => {
  // Define the validation schema
  const validationSchema = Yup.object().shape({
    accessories: Yup.array()
      .of(
        Yup.object().shape({
          type: Yup.string()
            .required("Type is required")
            .test(
              "is-valid-type-for-position",
              "For even positions, only R and U types are allowed",
              function (value) {
                const { index } = this.options.from[1];
                // Even positions (0-indexed) can only have R or U
                if (index % 2 === 1 && value === "S") {
                  return false;
                }
                return true;
              }
            ),
          mac: Yup.string()
            .test(
              "conditional-required",
              "MAC address is required for type S and R",
              function (value) {
                const { type } = this.parent;
                if ((type === "S" || type === "R") && !value) {
                  return false;
                }
                return true;
              }
            )
            .test(
              "mac-format",
              "MAC must be 12 alphanumeric characters",
              function (value) {
                const { type } = this.parent;
                // Only validate if there's a value or if it's required
                if (value || type === "S" || type === "R") {
                  return value && /^[a-zA-Z0-9]{12}$/.test(value);
                }
                return true;
              }
            ),
        })
      )
      .max(maxAllowed, `Maximum ${maxAllowed} accessories allowed`),
  });

  // Initial form values based on the image
  const initialValues = {
    accessories: [
      { type: "S", mac: "LKV413FBACCa" },
      { type: "R", mac: "7805414BLAKS" },
      { type: "S", mac: "7253413FB919" },
      { type: "R", mac: "7805414B724A" },
      { type: "U", mac: "" },
      { type: "S", mac: "" },
    ],
  };

  // Formik setup
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      if (values.accessories.length === 4) return;
      let res = values.accessories.map((accessory, index) => {
        const message = `Accessory #${index + 1}:
        - Type: ${accessory.type}
        - Full Type Name: ${getTypeDisplay(accessory.type)}
        - MAC: ${accessory.mac}`;
        return message;
      });

      alert("Form submitted successfully!\n\n" + res.join("\n\n"));

      alert(alertMessage);
    },
  });

  const getFieldError = (index, field) => {
    const touched = formik.touched.accessories?.[index]?.[field];
    const error = formik.errors.accessories?.[index]?.[field];
    return touched && error ? error : "";
  };

  const handleAddAccessory = () => {
    if (formik.values.accessories.length < maxAllowed) {
      const newAccessories = [...formik.values.accessories];
      const isEvenPosition = newAccessories.length % 2 === 1;
      const defaultType = isEvenPosition ? "R" : "U";
      newAccessories.push({ type: defaultType, mac: "" });
      formik.setFieldValue("accessories", newAccessories);
    }
  };

  const handleRemoveAccessory = (index) => {
    const newAccessories = [...formik.values.accessories];
    if (newAccessories.length === 1) return;
    newAccessories.splice(index, 1);
    formik.setFieldValue("accessories", newAccessories);
  };

  const getTypeDisplay = (type) => {
    switch (type) {
      case "S":
        return "S";
      case "R":
        return "R";
      case "U":
        return "U";
      default:
        return type;
    }
  };

  const getTypeButtonStyle = () => {
    const baseStyle = {
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold",
      width: "110px",
      border: "1px solid #e0e0e0",
      color: "#555",
      backgroundColor: "#f5f5f5",
      textAlign: "left",
      padding: "8px 12px",
      "&:hover": {
        backgroundColor: "#e8e8e8",
      },
    };
    return baseStyle;
  };

  return (
    <Box sx={{ mx: "auto", my: 4 }}>
      <Paper sx={{ p: 3, position: "relative" }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 4 }}
        >
          Bluetooth Accessories ({formik.values.accessories.length})
        </Typography>

        {/* Lock icon - top right */}
        <Box sx={{ position: "absolute", top: 20, right: 20 }}>
          <Tooltip title="lock" placement="right-start">
            <LockIcon />
          </Tooltip>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          {/* Add Accessory Button at the top */}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddAccessory}
              disabled={
                formik.values.accessories.length === maxAllowed ? true : false
              }
              sx={{
                borderRadius: "20px",
                border: "1px solid #ddd",
                px: 3,
                py: 1,
                backgroundColor:
                  formik.values.accessories.length === maxAllowed
                    ? "#f5f5f5"
                    : "#388e3c",
                color:
                  formik.values.accessories.length === maxAllowed
                    ? "#888"
                    : "white",
                "&:hover": {
                  backgroundColor:
                    formik.values.accessories.length === maxAllowed
                      ? "#f5f5f5"
                      : "#2e7d32",
                },
              }}
            >
              Add Accessory
            </Button>
          </Box>

          {formik.values.accessories.map((accessory, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                position: "relative",
              }}
            >
              {/* Index Number with asterisk */}
              <Typography
                sx={{
                  minWidth: "50px",
                  color: "#ff6b6b",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                * #{index + 1}
              </Typography>

              {/* Type Selector */}
              <FormControl
                error={!!getFieldError(index, "type")}
                sx={{ mx: 1, minWidth: "110px" }}
              >
                <Select
                  id={`type-${index}`}
                  name={`accessories[${index}].type`}
                  value={accessory.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  displayEmpty
                  sx={getTypeButtonStyle(accessory.type)}
                  MenuProps={{
                    PaperProps: {
                      sx: { maxHeight: 200 },
                    },
                  }}
                  renderValue={(selected) => (
                    <Typography variant="body2" component="span">
                      {getTypeDisplay(selected)}
                    </Typography>
                  )}
                >
                  <MenuItem value="S" disabled={index % 2 === 1}>
                    S
                  </MenuItem>
                  <MenuItem value="R">R</MenuItem>
                  <MenuItem value="U">U</MenuItem>
                </Select>
                {getFieldError(index, "type") && (
                  <FormHelperText error>
                    {getFieldError(index, "type")}
                  </FormHelperText>
                )}
              </FormControl>

              {/* MAC Label */}
              <Typography sx={{ mx: 1, fontWeight: "bold", fontSize: "14px" }}>
                MAC
                {(accessory.type === "S" || accessory.type === "R") && (
                  <span style={{ color: "#ff6b6b", marginLeft: "2px" }}>*</span>
                )}
              </Typography>

              {/* MAC Address Field */}
              <TextField
                id={`mac-${index}`}
                name={`accessories[${index}].mac`}
                value={accessory.mac}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!getFieldError(index, "mac")}
                placeholder="MAC Address"
                variant="outlined"
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                  },
                }}
              />

              {/* Remove Button */}
              <IconButton
                onClick={() => handleRemoveAccessory(index)}
                disabled={index === 0 ? true : false}
                sx={{
                  ml: 1,
                  color: "#ff6b6b",
                }}
                size="small"
              >
                <CloseIcon />
              </IconButton>

              {/* Error message for MAC */}
              {getFieldError(index, "mac") && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{
                    position: "absolute",
                    bottom: -18,
                    left: 160,
                  }}
                >
                  {getFieldError(index, "mac")}
                </Typography>
              )}

              {/* Helper text for MAC */}
            </Box>
          ))}

          {formik.errors.accessories &&
            typeof formik.errors.accessories === "string" && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {formik.errors.accessories}
              </Typography>
            )}

          {/* Save Button */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Tooltip
              title="Save enable automatically if item count is 5"
              placement="right-start"
            >
              {" "}
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: "20px",
                  px: 4,
                  py: 1.2,
                  disabled: formik.values.accessories.length >= 5,
                  backgroundColor:
                    formik.values.accessories.length >= 5
                      ? "#4caf50"
                      : "#e0e0e0",
                  color:
                    formik.values.accessories.length >= 5 ? "white" : "#888",
                  "&:hover": {
                    backgroundColor:
                      formik.values.accessories.length >= 5
                        ? "#388e3c"
                        : "#e0e0e0",
                  },
                }}
              >
                Save Changes
              </Button>
            </Tooltip>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default BluetoothAccessoryManager;
