
export class Mount {
    private _name: string;
    private _id: number;
    private _floor: number;
    private _image: string;
    private _breedingCompatibility: { [partnerId: number]: number; };

    constructor(name: string, id: number, floor: number, image: string, breedingCompatibility: { [partnerId: number]: number; } = {}) {
        this._name = name;
        this._id = id;
        this._floor = floor;
        this._image = image;
        this._breedingCompatibility = breedingCompatibility;
    };

    get name() {
        return this._name;
    };
    get id() {
        return this._id;
    };
    get floor() {
        return this._floor;
    };
    get image() {
        return this._image;
    };
    get breedingCompatibility() {
        return this._breedingCompatibility;
    };

    canBreedWith(otherMount: Mount): boolean {
        return this._breedingCompatibility.hasOwnProperty(otherMount.id);
    };

    getBreedingResult(otherMount: Mount): number | null {
        if (this.canBreedWith(otherMount)) return this._breedingCompatibility[otherMount.id];
        if (otherMount.canBreedWith(this)) return otherMount._breedingCompatibility[this.id];
        return null;
    };

    static getBreedingResult(mount1: Mount, mount2: Mount): number | null {
        return mount1.getBreedingResult(mount2) ?? mount2.getBreedingResult(mount1) ?? null;
    };
};


export const mounts = [
    new Mount("Stoneback", 0, 205, "https://i.ibb.co/GqZNz4h/stoneback.png", {}),
    new Mount("Dropple", 1, 120, "https://i.ibb.co/LzzLjcHW/dropple.png", { 2: 3 }),
    new Mount("Brunegarde", 2, 165, "https://i.ibb.co/DH8f1BJ1/brunegarde.png", { 1: 3 }),
    new Mount("Dropplegarde", 3, 220, "https://i.ibb.co/j9GXjzyM/dropplegarde.png", { 4: 5 }),
    new Mount("Shellby", 4, 235, "https://i.ibb.co/5htY2s9h/shellby.png", { 3: 5 }),
    new Mount("Shellgarde", 5, 220, "https://i.ibb.co/N6Rh2M1q/shellgarde.png", {}),
];
