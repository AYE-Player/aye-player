import { InputBase } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import { observer } from "mobx-react-lite";
import React from "react";
import styled from "styled-components";
/* import { RootStoreModel } from "../dataLayer/stores/RootStore";
import { formattedDuration } from "../helpers";
import useInject from "../hooks/useInject"; */

const Header = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
`;

const Container = styled.div`
  height: 100%;
`;

const PlaylistContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px;
  height: 100%
`;

const ScrollContainer = styled.div`
  overflow: auto;
  height: calc(100% - 128px);
`;

const Search = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #565f6c;
  border-radius: 4px;
`;

const SearchIconContainer = styled.div`
  margin-right: 8px;

`;

const SearchPage: React.FunctionComponent = () => {
  /*const [open, setOpen] = React.useState(false);

  const Store = ({ playlists }: RootStoreModel) => ({
    playlists
  });

  const { playlists } = useInject(Store);*/

  return (
    <Container>
      <Header>Search</Header>
      <PlaylistContainer>
        <ScrollContainer>
        <Search>
            <SearchIconContainer>
              <SearchIcon />
            </SearchIconContainer>
            <InputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        </ScrollContainer>
      </PlaylistContainer>
    </Container>
  );
};

export default observer(SearchPage);
