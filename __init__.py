import tkinter as tk
from tkinter import *
from tkinter import filedialog
import ipfsapi
import ffmpeg
import os
from web3 import Web3
import base58
import binascii
from hexbytes import HexBytes
from PIL import Image, ImageTk
import webbrowser
import shutil
import threading
from Crypto.Cipher import AES

class Y3(tk.Tk):

    def __init__(self, *args, **kwargs):
        tk.Tk.__init__(self, *args, **kwargs)

        self.title("Y3")
        self.geometry("800x450")
        self.resizable(width=False, height=False)

        self.current_view = None
        self.update_master(Loading)
        threading.Timer(1, lambda frame=Playlist: self.update_master(frame)).start()

    def update_master(self, view):
        if self.current_view is not None:
            self.current_view.destroy()
        self.current_view = view(self).view
        self.current_view.pack(fill=BOTH, expand=1)


class IPFSNode:

    def __init__(self):
        self.api = ipfsapi.connect()

    @staticmethod
    def cut_ipfs_hash(ipfs_hash):
        return base58.b58decode(ipfs_hash)[:2], base58.b58decode(ipfs_hash)[2:]

    @staticmethod
    def combine_ipfs_hash(evm_hash):
        return base58.b58encode(binascii.unhexlify(evm_hash.hex())).decode("utf-8")

    @staticmethod
    def is_valid_hash(identifier):
        return identifier == "Qm"

    @staticmethod
    def pad_key(key):
        return bytes('{0:<16}'.format(key), "utf-8")


class Contract:

    def __init__(self, contract="0x2305e7b8aeacd15d3b79f8a9ab48e3eca75f570f", abi='[{"constant": false, "inputs": [{"name": "_identifier", "type": "bytes2"}, {"name": "_hash", "type": "bytes32"}, {"name": "_title", "type": "string"}, {"name": "_category", "type": "string"}], "name": "addVideo", "outputs": [{"name": "", "type": "uint256"}], "payable": false, "stateMutability": "nonpayable", "type": "function"}, {"constant": true, "inputs": [{"name": "", "type": "uint256"}], "name": "playlist", "outputs": [{"name": "id", "type": "uint256"}, {"name": "publisher", "type": "address"}, {"name": "identifier", "type": "bytes2"}, {"name": "hash", "type": "bytes32"}, {"name": "title", "type": "string"}, {"name": "category", "type": "string"}], "payable": false, "stateMutability": "view", "type": "function"}, {"constant": true, "inputs": [], "name": "playlistLength", "outputs": [{"name": "", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"}]'):
        self.web3 = Web3(Web3.HTTPProvider("http://ropsten.infura.io/v3/545e14c45ee44e37aa8483f364120f11"))
        contract_checksum = self.web3.toChecksumAddress(contract);
        self.contract = self.web3.eth.contract(address=contract_checksum, abi=abi)

    def get_video(self, id):
        return self.contract.functions.playlist(id).call()

    def print_video(self, id):
        id, publisher, is_private, identifier, evm_hash, title, category = self.get_video(id)
        print("{:<20}{:<20}\n{:<20}{:<20}\n{:<20}{:<20}\n{:<20}{:<20}\n{:<20}{:<20}\n{:<20}{:<20}\n{:<20}{:<20}".format("id:", id, "publisher:", publisher, "is_private:", is_private, "identifier:", HexBytes(identifier).hex(), "evm_hash", HexBytes(evm_hash).hex(), "title", title, "category", category))

    def playlist_length(self):
        return 0

    def get_lst(self):
        videos = []
        for i in range(self.playlist_length()):
            id, publisher, is_private, identifier, evm_hash, title, category = self.get_video(i)
            videos.append({"id": id, "publisher": publisher, "is_private": is_private, "identifier": identifier, "evm_hash": evm_hash, "title": title, "category": category})
        return videos


class EthAccount(Contract):

    def __init__(self, pk="CFCB8ACFD0B4C64A6B6366F79C97AA7502396FFD6C61DC92C8E8BEFCAFA72311"):
        Contract.__init__(self)
        self.account = self.web3.eth.account.privateKeyToAccount(pk)
        self.tx_info = {"from": self.account.address, "nonce": None}

    def update_nonce(self):
        self.tx_info["nonce"] = self.web3.eth.getTransactionCount(self.account.address)

    def new_video(self, is_private, identifier, evm_hash, title, category):
        self.update_nonce()
        tx = self.contract.functions.addVideo(is_private, identifier, evm_hash, title, category).buildTransaction(self.tx_info)
        return tx

    def get_raw_tx(self, tx):
        signed_tx = self.account.signTransaction(tx)
        return signed_tx.rawTransaction


class Controller:

    def __init__(self, master, view):
        self.view = view(master)


class Playlist(Controller):

    def __init__(self, master):
        Controller.__init__(self, master, PlaylistView)

        self.eth_contract = Contract()
        self.ipfs_node = IPFSNode()

        self.model = PlaylistModel()

        self.has_been_clicked = {self.is_search_bar: False, self.is_password_entry: False}
        self.view.search_bar.bind("<Button>", lambda event, entry=self.is_search_bar: self.clear_entry(entry))
        self.view.password_entry.bind("<Button>", lambda event, entry=self.is_password_entry: self.clear_entry(entry))

        self.view.search_btn.bind("<Button>", lambda event, key=self.view.search.get, lst=self.eth_contract.get_lst: self.prepare_search(key, lst))

        for i in range(self.eth_contract.playlist_length()):
            if i < 3:
                self.playlist_col(self.view.videos1, i, i)
            else:
                self.playlist_col(self.view.videos2, i - 3, i)

        self.view.upload_video.bind("<Button>", lambda event: master.update_master(Upload))
        self.view.refresh.bind("<Button>", lambda event: master.update_master(Playlist))

    def prepare_search(self, key, lst):
        matches, x = self.find_match(key(), lst())
        playlist_length = self.eth_contract.playlist_length()

        for i in range(playlist_length):
            if i < 3:
                self.view.videos1[i].thumbnail.configure(image="")
                self.view.videos1[i].title.set("")
                self.view.videos1[i].category.set("")
            else:
                self.view.videos2[i-3].thumbnail.configure(image="")
                self.view.videos2[i-3].title.set("")
                self.view.videos2[i-3].category.set("")

        count = 0
        for i in range(playlist_length):
            if i in matches:
                identifier = x[i]["identifier"]
                evm_hash = x[i]["evm_hash"]
                title = x[i]["title"]
                category = x[i]["category"]

                ipfs_hash = self.ipfs_node.combine_ipfs_hash(identifier+evm_hash)
                thumbnail_hash = self.model.get_ipfs_object(self.ipfs_node, ipfs_hash)["Links"][-1]["Hash"]
                self.model.get(self.ipfs_node, thumbnail_hash)

                filename = "downloads/thumbnail.png"
                os.rename(thumbnail_hash, filename)
                thumbnail = ImageTk.PhotoImage(Image.open(filename).resize((160, 90), Image.ANTIALIAS))

                if count < 3:
                    self.view.videos1[count].thumbnail.configure(image=thumbnail)
                    self.view.videos1[count].thumbnail.image = thumbnail
                    self.view.videos1[count].title.set(title)
                    self.view.videos1[count].category.set(category)
                else:
                    self.view.videos2[count-3].thumbnail.configure(image=thumbnail)
                    self.view.videos2[count-3].thumbnail.image = thumbnail
                    self.view.videos2[count-3].title.set(title)
                    self.view.videos2[count-3].category.set(category)

                count = count + 1

    def find_match(self, key, lst):
        filtered_list = []
        str_arr = key.split()
        for x in str_arr:
            for index, y in enumerate(lst):
                if x.lower() in (y["title"].lower()):
                    filtered_list.append(index)
        return list(set(filtered_list)), lst

    def playlist_col(self, video_lst, i, id):
        id, _, is_private, identifier, evm_hash, title, category = self.eth_contract.get_video(id)

        if not is_private:
            ipfs_hash = self.ipfs_node.combine_ipfs_hash(identifier+evm_hash)
            thumbnail_hash = self.model.get_ipfs_object(self.ipfs_node, ipfs_hash)["Links"][-1]["Hash"]
            self.model.get(self.ipfs_node, thumbnail_hash)

            filename = "downloads/thumbnail.png"
            os.rename(thumbnail_hash, filename)
        else:
            filename = "private_video.gif"
        thumbnail = ImageTk.PhotoImage(Image.open(filename).resize((160, 90), Image.ANTIALIAS))
        video_lst[i].thumbnail.configure(image=thumbnail)
        video_lst[i].thumbnail.image = thumbnail

        video_lst[i].thumbnail.bind("<Button>", lambda event, x=id: self.play_video(x))

        video_lst[i].title.set(title)
        video_lst[i].category.set(category)

    def play_video(self, id):
        print(id)
        _, _, is_private, identifier, evm_hash, title, category = self.eth_contract.get_video(id)

        ipfs_hash = ""
        if is_private:
            key2 = self.ipfs_node.pad_key(self.view.password.get())
            obj2 = AES.new(key2, AES.MODE_CFB, b'This is an IV456')
            ipfs_hash = self.ipfs_node.combine_ipfs_hash(obj2.decrypt(identifier + evm_hash))

            if not self.ipfs_node.is_valid_hash(ipfs_hash[:2]):
                return

        else:
            ipfs_hash = self.ipfs_node.combine_ipfs_hash(identifier + evm_hash)

        self.model.get(self.ipfs_node, ipfs_hash)

        output_dir = "downloads/" + title + ".mp4"
        ffmpeg.input(ipfs_hash + "/seg.m3u8").output(output_dir).run(overwrite_output=True)
        #shutil.rmtree(ipfs_hash)

        chrome_path = 'open -a /Applications/Google\ Chrome.app %s'
        webbrowser.get(chrome_path).open(output_dir)

    # TODO: refractor into controller class
    def is_search_bar(self):
        self.view.search.set("")

    def is_password_entry(self):
        self.view.password.set("")

    def clear_entry(self, entry):
        if self.has_been_clicked[entry]:
            return
        self.has_been_clicked[entry] = True
        entry()


class PlaylistView(tk.Frame):

    def __init__(self, master):
        tk.Frame.__init__(self, master)
        self.config(bg='#E8E8E8')

        search_frame_color = '#f8bb4b'
        self.search_frame = tk.Frame(self, bg=search_frame_color)
        self.search_frame.pack(fill=X, ipady=20)

        self.search = StringVar(value="Search")
        self.search_bar = tk.Entry(self.search_frame, textvariable=self.search, highlightbackground=search_frame_color)
        self.search_bar.pack(fill=X, expand=1, side=LEFT, padx=5)

        self.search_btn = tk.Button(self.search_frame, text="Search", highlightbackground=search_frame_color)
        self.search_btn.pack(side=RIGHT)

        nav_frame_color = 'gray50'
        self.nav_frame = tk.Frame(self, bg=nav_frame_color)
        self.nav_frame.pack(fill=Y, side=LEFT)

        self.upload_video = tk.Button(self.nav_frame, text="Upload video", highlightbackground=nav_frame_color)
        self.upload_video.pack(padx=10, pady=10)

        self.refresh = tk.Button(self.nav_frame, text="Refresh", highlightbackground=nav_frame_color)
        self.refresh.pack(padx=10)

        self.password = StringVar(value="Password")
        self.password_entry = tk.Entry(self.nav_frame, textvariable=self.password, highlightbackground=nav_frame_color)
        self.password_entry.pack(padx=5, pady=100)

        self.video_lst_frame1 = tk.Frame(self, bg="#E8E8E8")
        self.video_lst_frame1.pack(fill=X, padx=25)
        self.videos1 = [self.Video(self.video_lst_frame1) for _ in range(3)]

        self.video_lst_frame2 = tk.Frame(self, bg="#E8E8E8")
        self.video_lst_frame2.pack(fill=X, padx=25)
        self.videos2 = [self.Video(self.video_lst_frame2) for _ in range(3)]

    class Video:

        def __init__(self, master):
            video_frame_color = "#E8E8E8"
            self.video_frame = tk.Frame(master, bg=video_frame_color)
            self.video_frame.pack(side=LEFT, pady=20, padx=10)

            self.thumbnail = tk.Label(self.video_frame, bg=video_frame_color)
            self.thumbnail.pack()

            self.title = StringVar()
            self.video_title = tk.Label(self.video_frame, textvariable=self.title, bg=video_frame_color)
            self.video_title.pack()

            self.category = StringVar()
            self.video_category = tk.Label(self.video_frame, textvariable=self.category, bg=video_frame_color)
            self.video_category.pack()


class PlaylistModel:

    @staticmethod
    def get_ipfs_object(node, ipfs_hash):
        return node.api.object_get(ipfs_hash)

    @staticmethod
    def get(node, ipfs_hash):
        return node.api.get(ipfs_hash)


class Upload(Controller):

    def __init__(self, master):
        Controller.__init__(self, master, UploadView)

        self.eth_account = EthAccount()
        self.ipfs_node = IPFSNode()

        self.model = UploadModel()

        self.file_path = ""
        self.is_private = False

        self.view.return_home.bind("<Button>", lambda event: master.update_master(Playlist))
        self.view.select_file_btn.bind("<Button>", self.open_file)
        self.view.publish_btn.bind("<ButtonRelease-1>", self.prepare_dir)
        self.view.password_enable.bind("<Button>", self.privacy_change)
        self.view.password_disable.bind("<Button>", self.privacy_change)

        self.has_been_clicked = {self.is_title: False, self.is_password: False}
        self.view.title_entry.bind("<Button>", lambda event, entry=self.is_title: self.clear_entry(entry))
        self.view.password_entry.bind("<Button>", lambda event, entry=self.is_password: self.clear_entry(entry))

    def privacy_change(self, event):
        if self.view.v.get() == 0:
            self.is_private = True
        else:
            self.is_private = False

    def is_title(self):
        self.view.title.set("")

    def is_password(self):
        self.view.password.set("")

    def clear_entry(self, entry):
        if self.has_been_clicked[entry]:
            return
        self.has_been_clicked[entry] = True
        entry()

    def std_out(self, output):
        self.view.log.set(output)

    def open_file(self, event):
        self.file_path = filedialog.askopenfilename()

        if not self.file_path.lower().endswith(('.mp4', '.mov')):
            self.std_out("Unsupported file type")
            return

        self.std_out(os.path.basename(self.file_path))

    # TODO: new directory needs to be deleted after upload
    # TODO: video fields need to be saved in local JSON file (allows user to keep track of their videos)
    def prepare_dir(self, event):
        if not self.file_path:
            return

        folder_name = os.path.basename(os.path.splitext(self.file_path)[0])
        dir = "uploads/" + folder_name

        if not os.path.exists(dir):
            os.makedirs(dir)

        thumbnail_path = dir + "/thumbnail.png"

        ffmpeg.input(self.file_path).output(thumbnail_path, vframes=1).run(overwrite_output=True);
        thumbnail = ImageTk.PhotoImage(Image.open(thumbnail_path).resize((320, 180), Image.ANTIALIAS))
        self.view.thumbnail.configure(image=thumbnail)
        self.view.thumbnail.image = thumbnail

        ffmpeg.input(self.file_path).output(dir + "/seg.m3u8", hls_list_size=0).run(overwrite_output=True)

        ipfs_hash = self.model.upload_dir_to_ipfs(self.ipfs_node, dir)[-1]["Hash"]
        print(self.model.upload_dir_to_ipfs(self.ipfs_node, dir))
        shutil.rmtree(dir)
        self.std_out("Video successfully uploaded to IPFS")
        print("IPFS Hash:", ipfs_hash)

        self.append_evm_playlist(ipfs_hash)

    def append_evm_playlist(self, ipfs_hash):
        identifier, evm_hash = self.ipfs_node.cut_ipfs_hash(ipfs_hash)
        title = self.view.title.get()
        category = self.view.category.get()

        if (self.is_private):
            key1 = self.ipfs_node.pad_key(self.view.password.get())
            obj = AES.new(key1, AES.MODE_CFB, b'This is an IV456')
            ciphertext = base58.b58encode(obj.encrypt(identifier + evm_hash)).decode("utf-8")
            identifier, evm_hash = self.ipfs_node.cut_ipfs_hash(ciphertext)
            tx = self.eth_account.new_video(self.is_private, identifier, evm_hash, title, category)
        else:
            tx = self.eth_account.new_video(self.is_private, identifier, evm_hash, title, category)
        raw_tx = self.eth_account.get_raw_tx(tx)
        self.model.send_tx_to_evm(self.eth_account, raw_tx)


class UploadView(tk.Frame):

    def __init__(self, master):
        tk.Frame.__init__(self, master)
        bg = '#f8bb4b'
        self.configure(bg=bg)

        self.return_home = tk.Button(self, text="Return Home", highlightbackground=bg)
        self.return_home.pack(pady=10)

        self.select_file_btn = tk.Button(self, text="Select file", highlightbackgroun=bg)
        self.select_file_btn.pack()

        self.log = StringVar(value="No file selected")
        self.std_out = tk.Label(self, textvariable=self.log, bg=bg)
        self.std_out.pack()

        self.video_info = tk.Frame(self, bg=bg)
        self.video_info.pack()

        self.title = StringVar(value="Title")
        self.title_entry = tk.Entry(self.video_info, textvariable=self.title, highlightbackground=bg)
        self.title_entry.pack(side=LEFT)

        categories = ["Film & Animation",
                      "Autos & Vehicles",
                      "Music",
                      "Pets & Animals",
                      "Sports",
                      "Travel & Events",
                      "Gaming",
                      "People & Blogs",
                      "Comedy",
                      "Entertainment",
                      "News & Politics",
                      "Howto & Style",
                      "Education",
                      "Science & Technology",
                      "Nonprofits & Activism"]
        self.category = StringVar(value=categories[0])
        self.category_menu = tk.OptionMenu(self.video_info, self.category, *categories)
        self.category_menu.configure(bg=bg)
        self.category_menu.pack(side=RIGHT)

        self.private_frame = tk.Frame(self, bg=bg)
        self.private_frame.pack(fill=Y, pady=20)

        self.v = IntVar()
        self.password_enable = Radiobutton(self.private_frame, text="Enable private video", variable=self.v, value=1, bg=bg)
        self.password_enable.pack(side=RIGHT)

        self.password_disable = Radiobutton(self.private_frame, text="Disable private video", variable=self.v, value=0, bg=bg)
        self.password_disable.pack(side=RIGHT)

        self.password = StringVar(value="Password")
        self.password_entry = tk.Entry(self.private_frame, textvariable=self.password, highlightbackground=bg)
        self.password_entry.pack(side=LEFT)

        self.publish_btn = tk.Button(self, text="Publish", highlightbackground=bg)
        self.publish_btn.pack()

        self.thumbnail = tk.Label(self, bg=bg)
        self.thumbnail.pack(pady=20)


class UploadModel:

    @staticmethod
    def upload_dir_to_ipfs(ipfs_node, dir):
        return ipfs_node.api.add(dir)

    @staticmethod
    def send_tx_to_evm(eth_account, raw_tx):
        eth_account.web3.eth.sendRawTransaction(raw_tx)


class Loading(Controller):

    def __init__(self, master):
        Controller.__init__(self, master, LoadingView)


class LoadingView(tk.Frame):

    def __init__(self, master):
        tk.Frame.__init__(self, master)

        self.thumbnail = ImageTk.PhotoImage(Image.open("logo.png").resize((800, 450), Image.ANTIALIAS))
        self.thumbnail_label = tk.Label(self, image=self.thumbnail).pack()
        self.thumbnail_label = self.thumbnail


if __name__ == "__main__":
    app = Y3()
    app.mainloop()
