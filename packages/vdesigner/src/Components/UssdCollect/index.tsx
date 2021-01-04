import React, { useState, useEffect, useContext } from "react";
import PanelStep, { IStepProps } from "../Steps/PanelStep";
import { Button, ButtonGroup } from "reactstrap";
import styled from "styled-components";
import UssdMiniMessage, { IMiniMessageData } from "./UssdMiniMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKeyboard, faSitemap } from "@fortawesome/free-solid-svg-icons";
import CollectionReply, { ICollectReplyData } from "./CollectionReply";
import MenuResponse, { IMenuResponseData } from "./MenuResponse";
import { ItemTypes } from "../../Utils/ItemTypes";
import { IStep, NodeContext } from "../../Data/NodesDataContext";
import { ensureArray } from "../../Utils";

const AddTextBtn = styled(Button)`
  font-size: 12px;
  color: ${({ theme }) => theme.primarybuttontextcolor};
  background-color: ${({ theme }) => theme.primarybuttonbackcolor};
  border-color: ${({ theme }) => theme.primarybuttonbackcolor};
  font-weight: bold;
`;

const CharLeftSpan = styled.span`
  background-color: #d1d1d1;
  display: inline;
  padding: 0.2em 0.6em 0.3em;
  font-size: 75%;
  font-weight: normal;
  line-height: 1;
  color: #727272;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25em;
`;

const CharLeftSpanRed = styled(CharLeftSpan)`
  color: #d9534f;
`;
const CollectActionDiv = styled.div`
  margin-top: 20px;
  margin-bottom: 15px;
`;

const UssdCollectStep = ({
  index,
  step,
  moduleName,
  moduleIndex,
}: IStepProps) => {
  const [modifyStep, setModifyStep] = useState<IStep>(() => {
    const u = { ...step };
    u.gatherType = step.gatherType || "menu";
    return {
      ...u,
    };
  });

  const [charLeft, setCharLeft] = useState(182);
  const { updateStep } = useContext(NodeContext);

  useEffect(() => {
    if (updateStep) {
      const { isMsgValid, messages, menu, collectdigits, ...rest } = modifyStep;

      if (rest.gatherType === "menu") {
        if (menu) {
          const mappings = ensureArray<IMenuResponseData>(menu.mappings).filter(
            (item) => item.next !== "" && item.digits !== ""
          );
          rest.menu = {
            mappings,
          };
        } else {
          rest.menu = { mappings: [] };
        }
      } else {
        rest.collectdigits = collectdigits;
      }
      rest.text = "";
      rest.messages = ensureArray<IMiniMessageData>(messages).filter(
        (msg) => msg.text !== ""
      );
      updateStep(moduleIndex, index, { ...rest, isValid: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modifyStep]);

  const updateCollectReply = (
    scope: string,
    next: string,
    collectVariable: string
  ) => {
    setModifyStep((u) => ({
      ...u,
      collectdigits: { scope, next, collectVariable },
    }));
  };

  const removeUssdMiniMessage = (idx: number) => {
    setModifyStep((u) => {
      if (u.messages && Array.isArray(u.messages)) {
        const allmsg = [...u.messages];
        allmsg.splice(idx, 1);
        u.isMsgValid = allmsg.length > 0;
        u.messages = allmsg;
      }
      return {
        ...u,
      };
    });
  };

  const addUssdMiniMessage = () => {
    const u = [
      ...ensureArray<IMiniMessageData>(modifyStep.messages),
      { text: "" },
    ];
    setModifyStep((g) => ({ ...g, messages: u }));
  };

  const handleUssdMiniMessage = (idx: number, miniMsg: IMiniMessageData) => {
    // update the modified step
    setModifyStep((u) => {
      u.messages[idx] = miniMsg;
      return { ...u };
    });
    const charLength = ensureArray<IMiniMessageData>(
      modifyStep.messages
    ).reduce(
      (acc, cur) => (cur.text === undefined ? 0 : cur.text.length) + acc,
      0
    );
    setCharLeft(182 - charLength);
  };

  const displayMessageCount = () => {
    if (charLeft < 0) {
      return (
        <CharLeftSpanRed>{`${Math.abs(
          charLeft
        )} characters will be truncated`}</CharLeftSpanRed>
      );
    }
    return <CharLeftSpan>{`${charLeft} characters left`}</CharLeftSpan>;
  };

  // extract the message for display
  const getMiniMessages = ensureArray<IMiniMessageData>(modifyStep.messages);

  const handleMenuClick = () => {
    setModifyStep((u) => {
      return { ...u, gatherType: "menu", isValid: true };
    });
  };

  const handleCollectionClick = () => {
    setModifyStep((u) => {
      return { ...u, gatherType: "collectdigits", isValid: true };
    });
  };

  const addMenuReplyAction = () => {
    const mappings: IMenuResponseData[] = [
      ...getMenuList,
      { digits: "", next: "" },
    ];
    setModifyStep((u) => {
      u.menu = { mappings };
      return { ...u };
    });
  };

  const handleMenuResponseChange = (Idx: number, data: IMenuResponseData) => {
    setModifyStep((u) => {
      u.menu.mappings[Idx] = data;
      return { ...u };
    });
  };

  const onRemoveMenuResponseItem = (arrIdx: number) => {
    setModifyStep((u) => {
      const y = [...u.mappings]; // make a copy of the existing array
      y.splice(arrIdx, 1);
      u.mappings = [...y];
      return { ...u };
    });
  };

  //extract ussd menu items for display
  const getMenuList: IMenuResponseData[] =
    modifyStep.menu !== undefined
      ? ensureArray<IMenuResponseData>(modifyStep.menu.mappings)
      : [];

  const getCollectReply = (): ICollectReplyData => {
    if (modifyStep.collectdigits) {
      return {
        next: modifyStep.collectdigits.next || "",
        collectVariable: modifyStep.collectdigits.collectVariable || "",
        scope: modifyStep.collectdigits.scope || "",
      };
    }
    return {
      next: "",
      collectVariable: "",
      scope: "",
    };
  };

  return (
    <PanelStep
      title={step.label}
      itemType={ItemTypes.USSDCollect}
      index={index}
      moduleName={moduleName}
    >
      <div>
        <div>{displayMessageCount()}</div>
        {getMiniMessages.map((txt, idx) => (
          <UssdMiniMessage
            key={`key-${idx}`}
            index={idx}
            data={txt}
            onChange={handleUssdMiniMessage}
            onClose={removeUssdMiniMessage}
          />
        ))}
      </div>
      <AddTextBtn size="sm" onClick={addUssdMiniMessage}>
        Add Text
      </AddTextBtn>
      <CollectActionDiv>
        <ButtonGroup>
          <Button
            active={modifyStep.gatherType === "menu"}
            onClick={handleMenuClick}
          >
            <FontAwesomeIcon icon={faSitemap} /> Menu
          </Button>
          <Button
            active={modifyStep.gatherType === "collectdigits"}
            onClick={handleCollectionClick}
          >
            <FontAwesomeIcon icon={faKeyboard} /> Collection Reply
          </Button>
        </ButtonGroup>
      </CollectActionDiv>
      {modifyStep.gatherType === "menu" ? (
        <div>
          {getMenuList.map((menu, idx) => (
            <MenuResponse
              key={`menu-${idx}`}
              index={idx}
              data={menu}
              onDataChange={handleMenuResponseChange}
              onClose={onRemoveMenuResponseItem}
            />
          ))}
          <AddTextBtn size="sm" onClick={addMenuReplyAction}>
            Add Option
          </AddTextBtn>
        </div>
      ) : (
        <div>
          <CollectionReply
            onUpdate={updateCollectReply}
            data={getCollectReply()}
          />
        </div>
      )}
    </PanelStep>
  );
};

export default UssdCollectStep;
