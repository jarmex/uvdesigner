import React, { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import useAxios from "../../Utils/AxiosRequest";

interface ICreateShortCode {
  isOpen: boolean;
  toggle: () => void;
  toggleRefresh: () => void;
}
const CreateShortCode = ({
  toggleRefresh,
  isOpen,
  toggle,
}: ICreateShortCode) => {
  const [scode, setSCode] = useState({
    shortcode: "",
    description: "",
    shortcodeValid: false,
    descriptionValid: false,
  });
  const { loading, data, error, request } = useAxios({
    method: "post",
    url: "uvd/shortcode/create",
    options: {
      manual: true,
    },
  });

  useEffect(() => {
    if (data && data.data.status === 0) {
      toggleRefresh();
    }
  }, [toggleRefresh, data]);

  const handleDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validName = `${e.target.name}Valid`;
    setSCode({
      ...scode,
      [e.target.name]: e.target.value,
      [validName]: e.target.value !== "",
    });
  };

  const handleToggle = () => {
    if (scode.descriptionValid && scode.shortcodeValid) {
      request({
        data: {
          mapKey: scode.shortcode,
          description: scode.description,
        },
      });
    }
  };
  return (
    <div>
      <Modal isOpen={isOpen} toggle={handleToggle}>
        <ModalHeader toggle={toggle}>Add New Shortcode</ModalHeader>
        <ModalBody>
          {error && <Alert color="danger">{error.message}</Alert>}
          {loading ? (
            <Container>
              <Spinner
                color="success"
                style={{ width: "4rem", height: "4rem" }}
              />
            </Container>
          ) : (
            <Form>
              <FormGroup>
                <Label for="shortcodeId">ShortCode</Label>
                <Input
                  type="text"
                  placeholder="Short Code"
                  id="shortcodeId"
                  name="shortcode"
                  value={scode.shortcode}
                  onChange={handleDataChanged}
                  invalid={!scode.shortcodeValid}
                />
              </FormGroup>
              <FormGroup>
                <Label for="descriptionId">Description</Label>
                <Input
                  type="textarea"
                  rows={3}
                  name="description"
                  value={scode.description}
                  onChange={handleDataChanged}
                  placeholder="Enter description here"
                  id="descriptionId"
                  invalid={!scode.descriptionValid}
                />
              </FormGroup>
            </Form>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={handleToggle}>
            Create Short Code
          </Button>{" "}
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CreateShortCode;
