import { useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import Button from "~/components/Button";
import { api } from "~/utils/api";

type AddPageProps = {};

const AddPage = (props: AddPageProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [input, setInput] = useState<string>("");
  const utils = api.useUtils();

  const {
    data: searchUser,
    // isLoading,
    // isError,
  } = api.user.findOne.useQuery({ username: input });

  const connectUserMutation = api.chat.connectUser.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (input.trim() === "") {
      return alert("Please enter a name or username.");
    }

    try {
      // Call the connectUser mutation
      const newConnection = await connectUserMutation.mutateAsync({
        username: input,
      });

      if (newConnection) {
        alert("Connected successfully!");

        await utils.chat.connectedUsers.invalidate();
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
    setInput("");
  };
  return (
    <main className="px-6 pt-8">
      <h1 className="mb-8 text-5xl font-bold">
        Add a friend to start chatting with them!
      </h1>
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="text"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Add friend by Name or Username
        </label>

        <div className="mt-2 flex gap-4">
          <input
            type="text"
            ref={inputRef}
            value={input}
            onChange={handleChange}
            className="block w-full rounded-md border-0 p-1.5 text-primaryText shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primaryText sm:text-sm sm:leading-6"
            placeholder="Enter Name or Username"
          />
          <Button title="Add" />
        </div>

        <div
          className="mt-10 flex w-[40%] items-center justify-start"
          onClick={handleSubmit}
        >
          <div
            className={`${searchUser ? "w-full rounded-md bg-secondaryBackground py-3 pl-3 text-primaryText hover:cursor-pointer hover:bg-primaryHover hover:text-secondaryText" : "py-3 pl-2 text-primaryText"}`}
          >
            {searchUser ? searchUser.name : "No user found..."}
            {searchUser && (
              <small className="block">{`Username: ${searchUser.username}`}</small>
            )}
          </div>
        </div>
      </form>
    </main>
  );
};

export default AddPage;
